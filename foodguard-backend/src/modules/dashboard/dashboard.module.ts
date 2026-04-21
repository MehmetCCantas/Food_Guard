import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '../users/infrastructure/repositories/user.orm-entity';
import { ProductOrmEntity } from '../products/infrastructure/repositories/product.orm-entity';

import { IDashboardService } from './application/ports/in/dashboard.in-ports';
import { IDashboardRepository } from '././application/ports/out/dashboard.out-ports';
import { DashboardService } from './application/services/dashboard.service';
import { GetLeaderboardUseCase } from './application/use-cases/get-leaderboard.use-case';
import { GetStatsUseCase } from './application/use-cases/get-stats.use-case';

import { DashboardController } from './infrastructure/controllers/dashboard.controller';
import { DashboardRepository } from './infrastructure/repositories/dashboard.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity, ProductOrmEntity])],
  controllers: [DashboardController],
  providers: [
    GetLeaderboardUseCase,
    GetStatsUseCase,
    {
      provide: IDashboardService,
      useClass: DashboardService,
    },
    {
      provide: IDashboardRepository,
      useClass: DashboardRepository,
    },
  ],
})
export class DashboardModule {}
