import { IRequestRepository as IRequestRepositoryFromRequest } from '../../../../requests/application/ports/out/request.out-ports';
import { Request } from '../../../../requests/domain/entities/request.entity';
import { IUserRepository as IUserRepositoryFromUser } from '../../../../users/application/ports/out/user.out-port';

import { Review } from '../../../domain/entities/review.entity';

export const IReviewRepository = Symbol('IReviewRepository');
export interface IReviewRepository {
  save(review: Review): Promise<Review>;
  findByRequestId(requestId: string): Promise<Review | null>;
  findByDonorId(donorId: string): Promise<Review[]>;
}

export const IRequestRepository = IRequestRepositoryFromRequest;
export interface IRequestRepository extends IRequestRepositoryFromRequest {
  findById(id: string): Promise<Request | null>;
}

export const IUserRepository = IUserRepositoryFromUser;
export interface IUserRepository extends IUserRepositoryFromUser {
  updateUserRating(userId: string, newRating: number): Promise<void>;
}
