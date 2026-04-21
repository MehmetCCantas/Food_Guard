import { Notification } from '../../../domain/entities/notification.entity';

export const INotificationRepository = Symbol('INotificationRepository');
export interface INotificationRepository {
  save(notification: Notification): Promise<Notification>;
  findByUserId(userId: string): Promise<Notification[]>;
}

export const INotificationGateway = Symbol('INotificationGateway');
export interface INotificationGateway {
  pushToUser(userId: string, notification: any): void;
}
