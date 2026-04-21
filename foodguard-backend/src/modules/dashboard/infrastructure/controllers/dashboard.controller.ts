import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IDashboardService } from '../../application/ports/in/dashboard.in-ports';
import { LeaderboardEntry } from '../../domain/entities/leaderboard.entity';
import { PlatformStats } from '../../domain/entities/platform-stats.entity';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    @Inject(IDashboardService)
    private readonly dashboardService: IDashboardService,
  ) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Gets the top donors leaderboard' })
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.dashboardService.getLeaderboard();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Gets general platform statistics' })
  async getStats(): Promise<PlatformStats> {
    return this.dashboardService.getStats();
  }
}
