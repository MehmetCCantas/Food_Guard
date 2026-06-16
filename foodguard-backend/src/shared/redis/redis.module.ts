import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('REDIS_URL');
        let client: Redis;
        if (url) {
          const useTls = url.startsWith('rediss://');
          client = new Redis(url, useTls ? { tls: {} } : {});
        } else {
          client = new Redis({
            host: configService.get<string>('REDIS_HOST') || 'localhost',
            port: configService.get<number>('REDIS_PORT') || 6379,
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
            lazyConnect: true,
          });
        }
        // Prevent unhandled error from crashing the process
        client.on('error', (err) => {
          console.error('Redis connection error:', err.message);
        });
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
