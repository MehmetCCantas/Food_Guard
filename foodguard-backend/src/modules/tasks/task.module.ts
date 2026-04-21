import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductOrmEntity } from '../products/infrastructure/repositories/product.orm-entity';
import { ITaskRepository } from './application/ports/out/task.out-ports';
import { TaskRepository } from './infrastructure/repositories/task.repository';
import { ProcessExpiredUseCase } from './application/use-cases/process-expired.use-case';
import { TaskService } from './application/services/task.service';
import { ExpirationCron } from './infrastructure/cron/expiration.cron';
import { TaskController } from './infrastructure/controllers/task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [TaskController],
  providers: [
    {
      provide: ITaskRepository,
      useClass: TaskRepository,
    },
    ProcessExpiredUseCase,
    TaskService,
    ExpirationCron,
  ],
})
export class TaskModule {}
