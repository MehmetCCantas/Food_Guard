import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RequestStatus } from '../../domain/enums/request.enum';
import { ProductStatus } from '../../../products/domain/enums/product.enum';
import {
  IProductRepository,
  IRequestRepository,
} from '../ports/out/request.out-ports';

@Injectable()
export class CompleteRequestUseCase {
  constructor(
    @Inject(IRequestRepository)
    private readonly requestRepository: IRequestRepository,
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(requestId: string, userId: string): Promise<void> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.recipientId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to complete this request',
      );
    }

    if (request.status !== RequestStatus.ACCEPTED) {
      throw new ConflictException('Only accepted requests can be completed');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.requestRepository.updateStatus(
        requestId,
        RequestStatus.COMPLETED,
        queryRunner.manager,
      );

      await this.productRepository.updateStatus(
        request.productId,
        ProductStatus.COMPLETED,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Transaction failed', err.message);
    } finally {
      await queryRunner.release();
    }
  }
}
