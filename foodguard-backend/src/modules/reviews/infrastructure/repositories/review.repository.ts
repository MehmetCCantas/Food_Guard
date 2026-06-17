import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../domain/entities/review.entity';
import { IReviewRepository } from '../../application/ports/out/review.out-ports';
import { ReviewOrmEntity } from './review.orm-entity';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(
    @InjectRepository(ReviewOrmEntity)
    private readonly ormRepository: Repository<ReviewOrmEntity>,
  ) {}

  private toDomain(ormEntity: ReviewOrmEntity): Review {
    const review = new Review();
    Object.assign(review, ormEntity);
    return review;
  }

  private toOrm(domainEntity: Review): ReviewOrmEntity {
    const ormEntity = new ReviewOrmEntity();
    Object.assign(ormEntity, domainEntity);
    return ormEntity;
  }

  async save(review: Review): Promise<Review> {
    const ormEntity = this.toOrm(review);
    const savedOrmEntity = await this.ormRepository.save(ormEntity);
    return this.toDomain(savedOrmEntity);
  }

  async findByRequestId(requestId: string): Promise<Review | null> {
    const ormEntity = await this.ormRepository.findOneBy({ requestId });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  async findByDonorId(donorId: string): Promise<Review[]> {
    const ormEntities = await this.ormRepository.find({
      where: { donorId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomain.bind(this));
  }
}
