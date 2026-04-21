import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import Redis from 'ioredis';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (method === 'GET' || method === 'DELETE') {
      return next.handle();
    }

    const idempotencyKey = request.headers['idempotency-key'];

    if (!idempotencyKey) {
      return next.handle();
    }

    const userId = request.user?.id || 'anonymous';
    const redisKey = `idempotency:${userId}:${idempotencyKey}`;
    const cachedResponse = await this.redis.get(redisKey);

    if (cachedResponse) {
      return of(JSON.parse(cachedResponse));
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.redis.set(
          redisKey,
          JSON.stringify(response),
          'EX',
          60 * 60 * 24, // 24 saat sakla
        );
      }),
    );
  }
}
