import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Review } from '../../domain/entities/review.entity';
import { RequestStatus } from '../../../requests/domain/enums/request.enum';
import { CreateReviewDto } from '../../infrastructure/dtos/create-review.dto';
import {
  IRequestRepository,
  IReviewRepository,
  IUserRepository,
} from '../ports/out/review.out-ports';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject(IReviewRepository)
    private readonly reviewRepository: IReviewRepository,
    @Inject(IRequestRepository)
    private readonly requestRepository: IRequestRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dto: CreateReviewDto,
    requestId: string,
    userId: string,
  ): Promise<Review> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.recipientId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to review this request',
      );
    }

    if (request.status !== RequestStatus.COMPLETED) {
      throw new ConflictException('Only completed requests can be reviewed');
    }

    const existingReview =
      await this.reviewRepository.findByRequestId(requestId);
    if (existingReview) {
      throw new ConflictException('A review already exists for this request');
    }

    const newReview = new Review();
    newReview.id = uuidv4();
    newReview.requestId = requestId;
    newReview.recipientId = userId;
    newReview.donorId = request.donorId;
    newReview.rating = dto.rating;
    newReview.comment = dto.comment;
    newReview.createdAt = new Date();

    const savedReview = await this.reviewRepository.save(newReview);

    await this.userRepository.updateUserRating(request.donorId, dto.rating);

    return savedReview;
  }
}
