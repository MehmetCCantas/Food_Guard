import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Request } from '../../domain/entities/request.entity';
import { RequestStatus } from '../../domain/enums/request.enum';
import { ProductStatus } from '../../../products/domain/enums/product.enum';
import {
  IProductRepository,
  IRequestRepository,
  INotificationService,
} from '../ports/out/request.out-ports';

@Injectable()
export class AcceptRequestUseCase {
  constructor(
    @Inject(IRequestRepository)
    private readonly requestRepository: IRequestRepository,
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
    @Inject(INotificationService)
    private readonly notificationService: INotificationService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(requestId: string, userId: string): Promise<Request> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.donorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to accept this request',
      );
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new ConflictException('Only pending requests can be accepted');
    }

    const product = await this.productRepository.findById(request.productId);
    if (!product || product.status !== ProductStatus.AVAILABLE) {
      await this.requestRepository.updateStatus(
        requestId,
        RequestStatus.REJECTED,
      );
      throw new ConflictException(
        'Product is no longer available; request has been rejected',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.requestRepository.updateStatus(
        requestId,
        RequestStatus.ACCEPTED,
        queryRunner.manager,
      );

      await this.productRepository.updateStatus(
        request.productId,
        ProductStatus.RESERVED,
        queryRunner.manager,
      );

      await this.requestRepository.rejectOtherPendingRequests(
        request.productId,
        requestId,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      try {
        await this.notificationService.sendNotification(
          request.recipientId,
          `Müjde! '${product.title}' için yaptığınız talep kabul edildi. Lütfen bağışçı ile iletişime geçin.`,
        );
      } catch (error) {
        console.error('Bildirim gönderilemedi:', error);
      }

      request.status = RequestStatus.ACCEPTED;
      (request as any).product = product;

      return request;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Transaction failed', err.message);
    } finally {
      await queryRunner.release();
    }
  }
}
