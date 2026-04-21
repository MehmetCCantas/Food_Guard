import { Review } from '../../domain/entities/review.entity';

export class ReviewResponseDto extends Review {
  constructor(partial: Partial<Review>) {
    super();
    Object.assign(this, partial);
  }
}
