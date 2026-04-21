import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from '../../domain/entities/request.entity';
import { RequestStatus } from '../../domain/enums/request.enum';
import {
  IProductRepository,
  IRequestRepository,
} from '../ports/out/request.out-ports';
import { PaginationQueryDto } from '../../../../shared/dtos/pagination-query.dto';
import { PaginatedResponseDto } from '../../../../shared/dtos/paginated-response.dto';

@Injectable()
export class ListRequestsForProductUseCase {
  constructor(
    @Inject(IRequestRepository)
    private readonly requestRepository: IRequestRepository,
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    productId: string,
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Request>> {
    const { limit, page, offset } = query;

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.donorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view requests for this product',
      );
    }

    const [requests, totalItems] =
      await this.requestRepository.findByProductIdAndStatus(
        productId,
        RequestStatus.PENDING,
        limit,
        offset,
      );

    return new PaginatedResponseDto(requests, totalItems, page, limit);
  }
}
