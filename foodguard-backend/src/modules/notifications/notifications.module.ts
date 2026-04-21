import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { INotificationService } from './application/ports/in/notification.in-ports';
import {
  INotificationGateway,
  INotificationRepository,
} from './application/ports/out/notification.out-ports';
import { NotificationService } from './application/services/notification.service';
import { SendNotificationUseCase } from './application/use-cases/send-notification.use-case';

import { NotificationGateway } from './infrastructure/gateways/notification.gateway';
import { NotificationRepository } from './infrastructure/repositories/notification.repository';
import { NotificationOrmEntity } from './infrastructure/repositories/notification.orm-entity';
import { NotificationController } from './infrastructure/controllers/notification.controller';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([NotificationOrmEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [
    SendNotificationUseCase,
    {
      provide: INotificationService,
      useClass: NotificationService,
    },
    {
      provide: INotificationRepository,
      useClass: NotificationRepository,
    },
    {
      provide: INotificationGateway,
      useClass: NotificationGateway,
    },
    NotificationGateway,
  ],
  exports: [INotificationService],
})
export class NotificationsModule {}
