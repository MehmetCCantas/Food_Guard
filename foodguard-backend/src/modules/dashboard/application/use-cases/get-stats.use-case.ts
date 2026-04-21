import { Inject, Injectable } from '@nestjs/common';
import { PlatformStats } from '../../domain/entities/platform-stats.entity';
import { IDashboardRepository } from '../ports/out/dashboard.out-ports';

@Injectable()
export class GetStatsUseCase {
  constructor(
    @Inject(IDashboardRepository)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(): Promise<PlatformStats> {
    return this.dashboardRepository.getPlatformStats();
  }
}
