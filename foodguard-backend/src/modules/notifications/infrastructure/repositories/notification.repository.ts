import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../application/ports/out/notification.out-ports';
import { NotificationOrmEntity } from './notification.orm-entity';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly ormRepository: Repository<NotificationOrmEntity>,
  ) {}

  private toDomain(ormEntity: NotificationOrmEntity): Notification {
    const notification = new Notification();
    Object.assign(notification, ormEntity);
    return notification;
  }

  private toOrm(domainEntity: Notification): NotificationOrmEntity {
    const ormEntity = new NotificationOrmEntity();
    Object.assign(ormEntity, domainEntity);
    return ormEntity;
  }

  async save(notification: Notification): Promise<Notification> {
    const ormEntity = this.toOrm(notification);
    const savedEntity = await this.ormRepository.save(ormEntity);
    return this.toDomain(savedEntity);
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const ormEntities = await this.ormRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomain);
  }
}
