import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductModule } from '../products/product.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { IRequestService } from './application/ports/in/request.in-ports';
import { IRequestRepository } from './application/ports/out/request.out-ports';
import { RequestService } from './application/services/request.service';
import { CreateRequestUseCase } from './application/use-cases/create-request.use-case';
import { AcceptRequestUseCase } from './application/use-cases/accept-request.use-case';
import { ListMyRequestsUseCase } from './application/use-cases/list-my-requests.use-case';
import { ListRequestsForProductUseCase } from './application/use-cases/list-requests-for-product.use-case';
import { RejectRequestUseCase } from './application/use-cases/reject-request.use-case';
import { CompleteRequestUseCase } from './application/use-cases/complete-request.use-case';

import { RequestController } from './infrastructure/controllers/request.controller';
import { RequestOrmEntity } from './infrastructure/repositories/request.orm-entity';
import { RequestRepository } from './infrastructure/repositories/request.repository';

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    forwardRef(() => ProductModule),
    TypeOrmModule.forFeature([RequestOrmEntity]),
  ],
  controllers: [RequestController],
  providers: [
    CreateRequestUseCase,
    AcceptRequestUseCase,
    ListMyRequestsUseCase,
    ListRequestsForProductUseCase,
    RejectRequestUseCase,
    CompleteRequestUseCase,
    {
      provide: IRequestService,
      useClass: RequestService,
    },
    {
      provide: IRequestRepository,
      useClass: RequestRepository,
    },
  ],
  exports: [IRequestRepository],
})
export class RequestModule {}
