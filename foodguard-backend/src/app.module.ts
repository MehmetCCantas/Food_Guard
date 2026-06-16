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
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const pgHost = configService.get<string>('PGHOST');

        if (pgHost) {
          // Railway auto-injected PG* variables
          console.log('Using Railway PG* variables, host:', pgHost);
          return {
            type: 'postgres',
            host: pgHost,
            port: configService.get<number>('PGPORT') || 5432,
            username: configService.get<string>('PGUSER') || 'postgres',
            password: configService.get<string>('PGPASSWORD'),
            database: configService.get<string>('PGDATABASE') || 'railway',
            ssl: { rejectUnauthorized: false },
            autoLoadEntities: true,
            synchronize: true,
            retryAttempts: 20,
            retryDelay: 5000,
          };
        }

        if (databaseUrl) {
          console.log('Using DATABASE_URL');
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            autoLoadEntities: true,
            synchronize: true,
            retryAttempts: 20,
            retryDelay: 5000,
          };
        }

        // Local development fallback
        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST') || 'localhost',
          port: configService.get<number>('DATABASE_PORT') || 5432,
          username: configService.get<string>('DATABASE_USER') || 'postgres',
          password: configService.get<string>('DATABASE_PASSWORD') || '',
          database: configService.get<string>('DATABASE_NAME') || 'foodguard',
          autoLoadEntities: true,
          synchronize: true,
        };
      },
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
