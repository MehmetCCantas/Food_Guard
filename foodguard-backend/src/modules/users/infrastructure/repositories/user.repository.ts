import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../application/ports/out/user.out-port';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
  ) {}

  private toDomain(ormEntity: UserOrmEntity): User {
    const user = new User();
    Object.assign(user, ormEntity);
    if (ormEntity.locationLat && ormEntity.locationLon) {
      user.location = {
        lat: ormEntity.locationLat,
        lon: ormEntity.locationLon,
      };
    }
    return user;
  }

  private toOrm(domainEntity: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    Object.assign(ormEntity, domainEntity);
    if (domainEntity.location) {
      ormEntity.locationLat = domainEntity.location.lat;
      ormEntity.locationLon = domainEntity.location.lon;
    }
    return ormEntity;
  }

  async save(user: User): Promise<User> {
    const ormEntity = this.toOrm(user);
    const savedOrmEntity = await this.ormRepository.save(ormEntity);
    return this.toDomain(savedOrmEntity);
  }

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOneBy({ id });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOneBy({ email });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  async findAll(): Promise<User[]> {
    const ormEntities = await this.ormRepository.find({
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((e) => this.toDomain(e));
  }

  async updateUserRating(userId: string, newRating: number): Promise<void> {
    const user = await this.ormRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found during rating update');
    }

    const currentTotalScore = user.ratingScore * user.ratingCount;
    const newRatingCount = user.ratingCount + 1;
    const newTotalScore = currentTotalScore + newRating;
    const newAverageScore = newTotalScore / newRatingCount;

    await this.ormRepository.update(userId, {
      ratingScore: newAverageScore,
      ratingCount: newRatingCount,
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.ormRepository.update(userId, {
      hashedRefreshToken: refreshToken || undefined,
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }
}
