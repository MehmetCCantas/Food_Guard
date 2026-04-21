import { Notification } from '../../../domain/entities/notification.entity';

export const INotificationService = Symbol('INotificationService');

export interface INotificationService {
  sendNotification(userId: string, message: string): Promise<void>;

  getMyNotifications(userId: string): Promise<Notification[]>;
}
