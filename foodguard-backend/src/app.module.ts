import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';

import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/products/product.module';
import { RequestModule } from './modules/requests/request.module';
import { AiAnalysisModule } from './modules/aianalysis/aianalysis.module';
import { ReviewModule } from './modules/reviews/review.module';
import { AdminModule } from './modules/admin/admin.module';
import { RedisModule } from './shared/redis/redis.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TaskModule } from './modules/tasks/task.module';
import { ChatModule } from './modules/chat/chat.module';
import { FirebaseAdminModule } from './modules/auth/infrastructure/firebase/firebase-admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    RedisModule,
    UserModule,
    AuthModule,
    ProductModule,
    RequestModule,
    AiAnalysisModule,
    ReviewModule,
    AdminModule,
    DashboardModule,
    NotificationsModule,
    TaskModule,
    ChatModule,
    FirebaseAdminModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
