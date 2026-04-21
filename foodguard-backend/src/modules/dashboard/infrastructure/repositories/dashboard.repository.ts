import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IDashboardRepository } from '../../application/ports/out/dashboard.out-ports';
import { LeaderboardEntry } from '../../domain/entities/leaderboard.entity';
import { PlatformStats } from '../../domain/entities/platform-stats.entity';
import { UserRole } from '../../../users/domain/enums/user-status.enum';
import { ProductStatus } from '../../../products/domain/enums/product.enum';
import { UserOrmEntity } from '../../../users/infrastructure/repositories/user.orm-entity';
import { ProductOrmEntity } from '../../../products/infrastructure/repositories/product.orm-entity';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getDonorLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    const rawData = await this.dataSource
      .getRepository(UserOrmEntity)
      .createQueryBuilder('user')
      .select([
        'user.id AS "userId"',
        'user.fullName AS "fullName"',
        'user.ratingScore AS "ratingScore"',
        'user.ratingCount AS "completedDonations"',
      ])
      .where('user.role = :role', { role: UserRole.DONOR })
      .andWhere('user.ratingCount > 0')
      .orderBy('user.ratingScore', 'DESC')
      .addOrderBy('user.ratingCount', 'DESC')
      .limit(limit)
      .getRawMany();

    return rawData.map((row) => ({
      userId: row.userId,
      fullName: row.fullName,
      ratingScore: parseFloat(row.ratingScore),
      completedDonations: parseInt(row.completedDonations, 10),
    }));
  }

  async getPlatformStats(): Promise<PlatformStats> {
    const totalDonors = await this.dataSource
      .getRepository(UserOrmEntity)
      .count({ where: { role: UserRole.DONOR } });

    const totalRecipients = await this.dataSource
      .getRepository(UserOrmEntity)
      .createQueryBuilder('user')
      .where('user.role IN (:...roles)', {
        roles: [
          UserRole.INDIVIDUAL_RECIPIENT,
          UserRole.ORGANIZATIONAL_RECIPIENT,
        ],
      })
      .getCount();

    const totalFoodSaved = await this.dataSource
      .getRepository(ProductOrmEntity)
      .count({ where: { status: ProductStatus.COMPLETED } });

    const { avgRating } = await this.dataSource
      .getRepository(UserOrmEntity)
      .createQueryBuilder('user')
      .select('AVG(user.ratingScore)', 'avgRating')
      .where('user.role = :role', { role: UserRole.DONOR })
      .andWhere('user.ratingCount > 0')
      .getRawOne();

    return {
      totalDonors,
      totalRecipients,
      totalFoodSaved,
      overallPlatformRating: parseFloat(avgRating || '0'),
    };
  }
}
