import { Injectable, Inject } from '@nestjs/common';
import { ITaskRepository } from '../ports/out/task.out-ports';

@Injectable()
export class ProcessExpiredUseCase {
  constructor(
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(): Promise<number> {
    return this.taskRepository.updateExpiredProducts();
  }
}
