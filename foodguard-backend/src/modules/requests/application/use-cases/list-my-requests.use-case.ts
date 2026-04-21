import { Inject, Injectable } from '@nestjs/common';
import { Request } from '../../domain/entities/request.entity';
import { IRequestRepository } from '../ports/out/request.out-ports';
import { PaginationQueryDto } from '../../../../shared/dtos/pagination-query.dto';
import { PaginatedResponseDto } from '../../../../shared/dtos/paginated-response.dto';

@Injectable()
export class ListMyRequestsUseCase {
  constructor(
    @Inject(IRequestRepository)
    private readonly requestRepository: IRequestRepository,
  ) {}

  async execute(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Request>> {
    const { limit, page, offset } = query;

    const [requests, totalItems] =
      await this.requestRepository.findByRecipientId(userId, limit, offset);

    return new PaginatedResponseDto(requests, totalItems, page, limit);
  }
}
