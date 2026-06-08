import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from '../persistence/orm-entities/message.orm-entity';
import { ConversationOrmEntity } from '../persistence/orm-entities/conversation.orm-entity';
import { UserOrmEntity } from '../../../users/infrastructure/repositories/user.orm-entity';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { MessageResponseDto } from '../dtos/message-response.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Kullanıcının aktif sohbetlerini getirir' })
  async getConversations(@Req() req: { user: { id: string } }) {
    const currentUserId = req.user.id;

    // Get all conversations involving current user
    const conversations = await this.conversationRepository.find({
      where: [
        { participant1Id: currentUserId },
        { participant2Id: currentUserId },
      ],
      relations: ['participant1', 'participant2', 'product'],
      order: { updatedAt: 'DESC' },
    });

    // For each conversation, fetch the last message and calculate unread count
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.participant1Id === currentUserId ? conv.participant2 : conv.participant1;
        if (!otherUser) return null;

        const lastMessage = await this.messageRepository.findOne({
          where: { conversationId: conv.id },
          order: { createdAt: 'DESC' },
        });

        const unreadCount = await this.messageRepository.count({
          where: {
            conversationId: conv.id,
            receiverId: currentUserId,
            isRead: false,
          },
        });

        return {
          id: conv.id,
          productId: conv.productId,
          product: conv.product ? { id: conv.product.id, title: conv.product.title } : undefined,
          updatedAt: conv.updatedAt,
          createdAt: conv.createdAt,
          unreadCount,
          lastMessage,
          participants: [
            {
              id: otherUser.id,
              fullName: otherUser.fullName,
              avatarUrl: '',
            },
          ],
        };
      }),
    );

    return result.filter(Boolean);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Yeni bir sohbet başlatır veya var olanı döner' })
  async startConversation(
    @Body() dto: { recipientId: string; productId?: string },
    @Req() req: { user: { id: string } },
  ) {
    const currentUserId = req.user.id;
    const recipientId = dto.recipientId;

    // Find any existing conversation between these users
    let conversation = await this.conversationRepository.findOne({
      where: [
        { participant1Id: currentUserId, participant2Id: recipientId },
        { participant1Id: recipientId, participant2Id: currentUserId },
      ],
      relations: ['participant1', 'participant2', 'product'],
    });

    // If conversation exists but lacks product (or we want to update the product link)
    if (conversation && dto.productId && !conversation.productId) {
      conversation.productId = dto.productId;
      await this.conversationRepository.save(conversation);
      // Re-fetch to populate product relation
      conversation = await this.conversationRepository.findOne({
        where: { id: conversation.id },
        relations: ['participant1', 'participant2', 'product'],
      });
    }

    if (!conversation) {
      // Create new one
      conversation = this.conversationRepository.create({
        participant1Id: currentUserId,
        participant2Id: recipientId,
        productId: dto.productId,
      });
      await this.conversationRepository.save(conversation);

      // Re-fetch to load relations
      conversation = await this.conversationRepository.findOne({
        where: { id: conversation.id },
        relations: ['participant1', 'participant2', 'product'],
      });
    }

    if (!conversation) {
      throw new Error('Failed to retrieve or create conversation');
    }

    const otherUser = conversation.participant1Id === currentUserId 
      ? conversation.participant2 
      : conversation.participant1;

    if (!otherUser) {
      throw new Error('Participant not found');
    }

    return {
      id: conversation.id,
      productId: conversation.productId,
      product: conversation.product ? { id: conversation.product.id, title: conversation.product.title } : undefined,
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt,
      unreadCount: 0,
      participants: [
        {
          id: otherUser.id,
          fullName: otherUser.fullName,
          avatarUrl: '',
        },
      ],
    };
  }

  @Get('history/:conversationId')
  @ApiOperation({ summary: 'Sohbete ait mesaj geçmişini getirir' })
  async getChatHistory(
    @Param('conversationId') conversationId: string,
    @Req() req: { user: { id: string } },
  ) {
    const currentUserId = req.user.id;

    // Verify conversation belongs to user
    const conversation = await this.conversationRepository.findOne({
      where: [
        { id: conversationId, participant1Id: currentUserId },
        { id: conversationId, participant2Id: currentUserId },
      ],
    });

    if (!conversation) {
      // Fallback/Backward compatibility: if conversationId is otherUserId, load their history
      return this.messageRepository.find({
        where: [
          { senderId: currentUserId, receiverId: conversationId },
          { senderId: conversationId, receiverId: currentUserId },
        ],
        order: { createdAt: 'ASC' },
      });
    }

    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  @Patch('conversations/:conversationId/read')
  @ApiOperation({ summary: 'Mesajları okundu olarak işaretler' })
  async markAsRead(
    @Param('conversationId') conversationId: string,
    @Req() req: { user: { id: string } },
  ) {
    const currentUserId = req.user.id;
    await this.messageRepository.update(
      { conversationId, receiverId: currentUserId, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }

  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Sohbete mesaj gönderir' })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() dto: { content: string },
    @Req() req: { user: { id: string } },
  ) {
    const currentUserId = req.user.id;

    const conversation = await this.conversationRepository.findOne({
      where: [
        { id: conversationId, participant1Id: currentUserId },
        { id: conversationId, participant2Id: currentUserId },
      ],
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const receiverId = conversation.participant1Id === currentUserId 
      ? conversation.participant2Id 
      : conversation.participant1Id;

    const messageEntity = this.messageRepository.create({
      content: dto.content,
      senderId: currentUserId,
      receiverId,
      conversationId: conversation.id,
      isRead: false,
    });

    await this.messageRepository.save(messageEntity);

    conversation.updatedAt = new Date();
    await this.conversationRepository.save(conversation);

    return messageEntity;
  }
}
