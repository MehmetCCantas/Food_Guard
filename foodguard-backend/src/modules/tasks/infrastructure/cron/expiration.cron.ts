import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskService } from '../../application/services/task.service';

@Injectable()
export class ExpirationCron {
  private readonly logger = new Logger(ExpirationCron.name);

  constructor(private readonly taskService: TaskService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    const affectedCount = await this.taskService.processExpiredProducts();
    if (affectedCount > 0) {
      this.logger.log(
        `${affectedCount} adet suresi gecmis ilan sistemden kaldirildi.`,
      );
    }
  }
}
