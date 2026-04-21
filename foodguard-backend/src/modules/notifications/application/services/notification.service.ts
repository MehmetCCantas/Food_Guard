import { Inject, Injectable } from '@nestjs/common';
import { Notification } from '../../domain/entities/notification.entity';
import { INotificationService } from '../ports/in/notification.in-ports';
import { INotificationRepository } from '../ports/out/notification.out-ports';
import { SendNotificationUseCase } from '../use-cases/send-notification.use-case';

@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    private readonly sendNotificationUseCase: SendNotificationUseCase,
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async sendNotification(userId: string, message: string): Promise<void> {
    return this.sendNotificationUseCase.execute(userId, message);
  }

  async getMyNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }
}
