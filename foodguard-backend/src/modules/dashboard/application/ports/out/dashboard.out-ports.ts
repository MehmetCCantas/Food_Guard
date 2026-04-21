import { LeaderboardEntry } from '../../../domain/entities/leaderboard.entity';
import { PlatformStats } from '../../../domain/entities/platform-stats.entity';

export const IDashboardRepository = Symbol('IDashboardRepository');

export interface IDashboardRepository {
  getDonorLeaderboard(limit: number): Promise<LeaderboardEntry[]>;
  getPlatformStats(): Promise<PlatformStats>;
}
