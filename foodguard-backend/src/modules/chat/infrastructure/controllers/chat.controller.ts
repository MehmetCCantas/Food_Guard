import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from '../persistence/orm-entities/message.orm-entity';
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
  ) {}

  @Get('history/:otherUserId')
  @ApiOperation({ summary: 'İki kullanıcı arasındaki mesaj geçmişini getirir' })
  @ApiResponse({ status: 200, type: [MessageResponseDto] })
  async getChatHistory(
    @Param('otherUserId') otherUserId: string,
    @Req() req: { user: { id: string } },
  ) {
    const currentUserId = req.user.id;
    return this.messageRepository.find({
      where: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
      order: { createdAt: 'ASC' },
    });
  }
}
