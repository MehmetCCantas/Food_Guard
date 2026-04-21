import { LeaderboardEntry } from '../../../domain/entities/leaderboard.entity';
import { PlatformStats } from '../../../domain/entities/platform-stats.entity';

export const IDashboardService = Symbol('IDashboardService');

export interface IDashboardService {
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getStats(): Promise<PlatformStats>;
}
