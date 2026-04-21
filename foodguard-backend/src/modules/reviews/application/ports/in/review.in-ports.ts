import { Review } from '../../../domain/entities/review.entity';
import { CreateReviewDto } from '../../../infrastructure/dtos/create-review.dto';

export const IReviewService = Symbol('IReviewService');

export interface IReviewService {
  createReview(
    dto: CreateReviewDto,
    requestId: string,
    userId: string,
  ): Promise<Review>;
}
