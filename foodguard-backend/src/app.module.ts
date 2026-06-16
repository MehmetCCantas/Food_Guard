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
      useFactory: () => {
        // Use process.env directly to bypass any ConfigService loading issues
        const pgHost = process.env.PGHOST;
        const pgPort = parseInt(process.env.PGPORT || '5432');
        const pgUser = process.env.PGUSER || 'postgres';
        const pgPassword = process.env.PGPASSWORD;
        const pgDatabase = process.env.PGDATABASE || 'railway';
        const databaseUrl = process.env.DATABASE_URL;

        console.log('=== DB CONFIG DEBUG ===');
        console.log('PGHOST:', pgHost || 'NOT SET');
        console.log('PGPORT:', process.env.PGPORT || 'NOT SET');
        console.log('PGUSER:', pgUser);
        console.log('PGDATABASE:', pgDatabase);
        console.log('DATABASE_URL prefix:', databaseUrl ? databaseUrl.substring(0, 40) + '...' : 'NOT SET');
        console.log('======================');

        if (pgHost) {
          console.log('Strategy: Using PGHOST individual variables');
          return {
            type: 'postgres',
            host: pgHost,
            port: pgPort,
            username: pgUser,
            password: pgPassword,
            database: pgDatabase,
            ssl: { rejectUnauthorized: false },
            autoLoadEntities: true,
            synchronize: true,
            retryAttempts: 20,
            retryDelay: 5000,
          } as any;
        }

        if (databaseUrl) {
          console.log('Strategy: Using DATABASE_URL');
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            autoLoadEntities: true,
            synchronize: true,
            retryAttempts: 20,
            retryDelay: 5000,
          } as any;
        }

        // Local development fallback
        console.log('Strategy: Local fallback (localhost)');
        return {
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT || '5432'),
          username: process.env.DATABASE_USER || 'postgres',
          password: process.env.DATABASE_PASSWORD || '',
          database: process.env.DATABASE_NAME || 'foodguard',
          autoLoadEntities: true,
          synchronize: true,
        } as any;
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
