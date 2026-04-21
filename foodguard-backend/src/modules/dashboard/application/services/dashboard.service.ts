import { Injectable } from '@nestjs/common';
import { LeaderboardEntry } from '../../domain/entities/leaderboard.entity';
import { PlatformStats } from '../../domain/entities/platform-stats.entity';
import { IDashboardService } from '../ports/in/dashboard.in-ports';
import { GetLeaderboardUseCase } from '../use-cases/get-leaderboard.use-case';
import { GetStatsUseCase } from '../use-cases/get-stats.use-case';

@Injectable()
export class DashboardService implements IDashboardService {
  constructor(
    private readonly getLeaderboardUseCase: GetLeaderboardUseCase,
    private readonly getStatsUseCase: GetStatsUseCase,
  ) {}

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.getLeaderboardUseCase.execute();
  }

  async getStats(): Promise<PlatformStats> {
    return this.getStatsUseCase.execute();
  }
}
