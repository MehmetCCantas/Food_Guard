import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ITaskRepository } from '../../application/ports/out/task.out-ports';
import { ProductOrmEntity } from '../../../products/infrastructure/repositories/product.orm-entity';
import { ProductStatus } from '../../../products/domain/enums/product.enum';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly productRepository: Repository<ProductOrmEntity>,
  ) {}

  async updateExpiredProducts(): Promise<number> {
    const result = await this.productRepository.update(
      {
        status: ProductStatus.AVAILABLE,
        expiresAt: LessThan(new Date()),
      },
      {
        status: ProductStatus.EXPIRED,
      },
    );

    return result.affected || 0;
  }
}
