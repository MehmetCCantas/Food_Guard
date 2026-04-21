import { Inject, Injectable } from '@nestjs/common';
import { LeaderboardEntry } from '../../domain/entities/leaderboard.entity';
import { IDashboardRepository } from '../ports/out/dashboard.out-ports';

@Injectable()
export class GetLeaderboardUseCase {
  constructor(
    @Inject(IDashboardRepository)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(): Promise<LeaderboardEntry[]> {
    const limit = 10;
    return this.dashboardRepository.getDonorLeaderboard(limit);
  }
}
