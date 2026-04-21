import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../../domain/entities/notification.entity';
import {
  INotificationGateway,
  INotificationRepository,
} from '../ports/out/notification.out-ports';

@Injectable()
export class SendNotificationUseCase {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
    @Inject(INotificationGateway)
    private readonly notificationGateway: INotificationGateway,
  ) {}

  async execute(userId: string, message: string): Promise<void> {
    const notification = new Notification();
    notification.id = uuidv4();
    notification.userId = userId;
    notification.message = message;
    notification.isRead = false;
    notification.createdAt = new Date();

    await this.notificationRepository.save(notification);

    this.notificationGateway.pushToUser(userId, notification);
  }
}
