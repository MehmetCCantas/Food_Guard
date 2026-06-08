import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from '../persistence/orm-entities/message.orm-entity';
import { ConversationOrmEntity } from '../persistence/orm-entities/conversation.orm-entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,
  ) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(`user_${userId}`);
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const senderId = client.handshake.query.userId as string;
    if (!senderId) return;

    let conversation: ConversationOrmEntity | null = null;

    // Check if conversationId is a conversation ID or a recipientId
    if (data.conversationId.length === 36) {
      conversation = await this.conversationRepository.findOne({
        where: { id: data.conversationId },
      });
    }

    // If not found by ID, it might be that the conversationId passed is actually the recipientId
    if (!conversation) {
      const recipientId = data.conversationId;
      conversation = await this.conversationRepository.findOne({
        where: [
          { participant1Id: senderId, participant2Id: recipientId },
          { participant1Id: recipientId, participant2Id: senderId },
        ],
      });

      // Create conversation if it doesn't exist yet
      if (!conversation) {
        conversation = this.conversationRepository.create({
          participant1Id: senderId,
          participant2Id: recipientId,
        });
        await this.conversationRepository.save(conversation);
      }
    }

    const receiverId = conversation.participant1Id === senderId 
      ? conversation.participant2Id 
      : conversation.participant1Id;

    const messageEntity = this.messageRepository.create({
      content: data.content,
      senderId,
      receiverId,
      conversationId: conversation.id,
      isRead: false,
    });
    
    await this.messageRepository.save(messageEntity);

    // Update conversation updatedAt timestamp
    conversation.updatedAt = new Date();
    await this.conversationRepository.save(conversation);

    // Send to recipient
    this.server.to(`user_${receiverId}`).emit('newMessage', {
      ...messageEntity,
      timestamp: messageEntity.createdAt,
    });

    // Send to sender (echo/sync across devices)
    this.server.to(`user_${senderId}`).emit('newMessage', {
      ...messageEntity,
      timestamp: messageEntity.createdAt,
    });
  }
}
