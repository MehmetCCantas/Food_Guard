import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.replace('Bearer ', '');

      if (!token) {
        console.log(`Socket ${client.id} rejected: No token`);
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, { secret });

      const userId = payload.userId;
      client.join(userId);

      console.log(`User ${userId} connected via WebSocket (ID: ${client.id})`);
    } catch (error) {
      console.log(`Socket ${client.id} rejected: Invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket ${client.id} disconnected`);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }

  pushToUser(userId: string, notification: any) {
    const payload = {
      id: notification.id,
      type: notification.type || 'NEW_REQUEST',
      title: 'Sistem Bildirimi',
      body: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      link: notification.link,
    };
    this.server.to(userId).emit('notification', payload);
  }
}
