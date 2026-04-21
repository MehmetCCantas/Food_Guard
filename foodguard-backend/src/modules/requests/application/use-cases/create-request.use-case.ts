import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Request } from '../../domain/entities/request.entity';
import { RequestStatus } from '../../domain/enums/request.enum';
import { CreateRequestDto } from '../../infrastructure/dtos/create-request.dto';
import {
  IProductRepository,
  IRequestRepository,
  INotificationService,
} from '../ports/out/request.out-ports';
import { ProductStatus } from '../../../products/domain/enums/product.enum';

@Injectable()
export class CreateRequestUseCase {
  constructor(
    @Inject(IRequestRepository)
    private readonly requestRepository: IRequestRepository,
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
    @Inject(INotificationService)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(
    dto: CreateRequestDto,
    productId: string,
    recipientId: string,
  ): Promise<Request> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('İlan bulunamadı.');
    }
    if (product.status !== ProductStatus.AVAILABLE) {
      throw new ConflictException('Bu ilan artık talep edilemez durumda.');
    }

    if (product.donorId === recipientId) {
      throw new ForbiddenException('Kendi ilanınıza talep gönderemezsiniz.');
    }

    const existingRequest =
      await this.requestRepository.findByProductIdAndRecipientId(
        productId,
        recipientId,
      );
    if (existingRequest && existingRequest.status === RequestStatus.PENDING) {
      throw new ConflictException(
        'Bu ilana zaten beklemede olan bir talebiniz var.',
      );
    }

    const newRequest = new Request();
    newRequest.id = uuidv4();
    newRequest.productId = productId;
    newRequest.recipientId = recipientId;
    newRequest.donorId = product.donorId;
    newRequest.status = RequestStatus.PENDING;
    newRequest.requestMessage = dto.message;
    newRequest.createdAt = new Date();
    newRequest.updatedAt = new Date();

    const savedRequest = await this.requestRepository.save(newRequest);

    // Donöre bildirim gönder
    try {
      await this.notificationService.sendNotification(
        product.donorId,
        `Yeni bir talep aldınız: '${product.title}' adlı ilanınız için bir talep geldi. Lütfen inceleyin.`
      );
    } catch (error) {
      console.error('Donöre bildirim gönderilemedi:', error);
    }

    return savedRequest;
  }
}
