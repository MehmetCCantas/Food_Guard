import { Injectable } from '@nestjs/common';
import { Review } from '../../domain/entities/review.entity';
import { CreateReviewDto } from '../../infrastructure/dtos/create-review.dto';
import { IReviewService } from '../ports/in/review.in-ports';
import { CreateReviewUseCase } from '../use-cases/create-review.use-case';

@Injectable()
export class ReviewService implements IReviewService {
  constructor(private readonly createReviewUseCase: CreateReviewUseCase) {}

  async createReview(
    dto: CreateReviewDto,
    requestId: string,
    userId: string,
  ): Promise<Review> {
    return this.createReviewUseCase.execute(dto, requestId, userId);
  }
}
