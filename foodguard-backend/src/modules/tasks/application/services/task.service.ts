import { Injectable } from '@nestjs/common';
import { ITaskService } from '../ports/in/task.in-ports';
import { ProcessExpiredUseCase } from '../use-cases/process-expired.use-case';

@Injectable()
export class TaskService implements ITaskService {
  constructor(private readonly processExpiredUseCase: ProcessExpiredUseCase) {}

  async processExpiredProducts(): Promise<number> {
    return this.processExpiredUseCase.execute();
  }
}
