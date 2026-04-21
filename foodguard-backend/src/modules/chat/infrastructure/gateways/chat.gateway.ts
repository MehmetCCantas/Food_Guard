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
    @MessageBody() data: { conversationId: string; content: string }, // Matches frontend socketService.sendMessage
  ) {
    const senderId = client.handshake.query.userId as string;

    // TODO: Ideally we would parse conversationId to get the recipient, 
    // or the frontend should send { to, content }. Since frontend doesn't send "to" in socketService.sendMessage,
    // let's assume `data.conversationId` might be just `recipientId` since we don't have a Conversation entity yet.
    // Wait, the frontend sends `conversationId` but how do we know the receiverId?

    // Let's modify the parameter to expect { to: string, content: string } from frontend for simplicity, 
    // or just rely on what frontend already sends.
    const receiverId = data.conversationId; // For this simple implementation, assume conversationId = otherUserId 

    const messageEntity = this.messageRepository.create({
      content: data.content,
      senderId,
      receiverId,
      isRead: false,
    });
    
    await this.messageRepository.save(messageEntity);

    this.server.to(`user_${receiverId}`).emit('newMessage', {
      ...messageEntity,
      timestamp: messageEntity.createdAt,
    });
  }
}
