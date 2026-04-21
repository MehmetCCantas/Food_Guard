import { Injectable } from '@nestjs/common';
import { Request } from '../../domain/entities/request.entity';
import { CreateRequestDto } from '../../infrastructure/dtos/create-request.dto';
import { IRequestService } from '../ports/in/request.in-ports';
import { CreateRequestUseCase } from '../use-cases/create-request.use-case';
import { AcceptRequestUseCase } from '../use-cases/accept-request.use-case';
import { ListMyRequestsUseCase } from '../use-cases/list-my-requests.use-case';
import { ListRequestsForProductUseCase } from '../use-cases/list-requests-for-product.use-case';
import { RejectRequestUseCase } from '../use-cases/reject-request.use-case';
import { CompleteRequestUseCase } from '../use-cases/complete-request.use-case';
import { PaginationQueryDto } from '../../../../shared/dtos/pagination-query.dto';
import { PaginatedResponseDto } from '../../../../shared/dtos/paginated-response.dto';
import { IRequestRepository } from '../ports/out/request.out-ports';
import { Inject } from '@nestjs/common';

@Injectable()
export class RequestService implements IRequestService {
  constructor(
    private readonly createRequestUseCase: CreateRequestUseCase,
    private readonly acceptRequestUseCase: AcceptRequestUseCase,
    private readonly listMyRequestsUseCase: ListMyRequestsUseCase,
    private readonly listRequestsForProductUseCase: ListRequestsForProductUseCase,
    private readonly rejectRequestUseCase: RejectRequestUseCase,
    private readonly completeRequestUseCase: CompleteRequestUseCase,
    @Inject(IRequestRepository)
    private readonly requestRepository: IRequestRepository,
  ) {}

  async createRequest(
    dto: CreateRequestDto,
    productId: string,
    recipientId: string,
  ): Promise<Request> {
    return this.createRequestUseCase.execute(dto, productId, recipientId);
  }

  async acceptRequest(requestId: string, userId: string): Promise<void> {
    await this.acceptRequestUseCase.execute(requestId, userId);
  }

  async listMyRequests(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Request>> {
    return this.listMyRequestsUseCase.execute(userId, query);
  }

  async listRequestsForProduct(
    productId: string,
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Request>> {
    return this.listRequestsForProductUseCase.execute(productId, userId, query);
  }

  async listIncomingRequests(
    donorId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Request>> {
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const [requests, totalItems] =
      await this.requestRepository.findIncomingRequests(donorId, limit, offset);

    return new PaginatedResponseDto(requests, totalItems, page, limit);
  }

  async rejectRequest(requestId: string, userId: string): Promise<void> {
    return this.rejectRequestUseCase.execute(requestId, userId);
  }

  async completeRequest(requestId: string, userId: string): Promise<void> {
    return this.completeRequestUseCase.execute(requestId, userId);
  }
}
