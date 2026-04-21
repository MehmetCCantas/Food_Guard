import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestModule } from '../requests/request.module';
import { UserModule } from '../users/user.module';

import { IReviewService } from './application/ports/in/review.in-ports';
import { IReviewRepository } from './application/ports/out/review.out-ports';
import { ReviewService } from './application/services/review.service';
import { CreateReviewUseCase } from './application/use-cases/create-review.use-case';

import { ReviewController } from './infrastructure/controllers/review.controller';
import { ReviewOrmEntity } from './infrastructure/repositories/review.orm-entity';
import { ReviewRepository } from './infrastructure/repositories/review.repository';

@Module({
  imports: [
    RequestModule,
    UserModule,
    TypeOrmModule.forFeature([ReviewOrmEntity]),
  ],
  controllers: [ReviewController],
  providers: [
    CreateReviewUseCase,
    {
      provide: IReviewService,
      useClass: ReviewService,
    },
    {
      provide: IReviewRepository,
      useClass: ReviewRepository,
    },
  ],
})
export class ReviewModule {}
