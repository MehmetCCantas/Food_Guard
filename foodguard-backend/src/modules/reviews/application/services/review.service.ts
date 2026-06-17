import { Injectable, Inject } from '@nestjs/common';
import { Review } from '../../domain/entities/review.entity';
import { CreateReviewDto } from '../../infrastructure/dtos/create-review.dto';
import { IReviewService } from '../ports/in/review.in-ports';
import { IReviewRepository } from '../ports/out/review.out-ports';
import { CreateReviewUseCase } from '../use-cases/create-review.use-case';

@Injectable()
export class ReviewService implements IReviewService {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    @Inject(IReviewRepository)
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async createReview(
    dto: CreateReviewDto,
    requestId: string,
    userId: string,
  ): Promise<Review> {
    return this.createReviewUseCase.execute(dto, requestId, userId);
  }

  async getDonorReviews(donorId: string): Promise<Review[]> {
    return this.reviewRepository.findByDonorId(donorId);
  }
}
