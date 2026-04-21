import { Request } from '../../../domain/entities/request.entity';
import { CreateRequestDto } from '../../../infrastructure/dtos/create-request.dto';
import { PaginationQueryDto } from '../../../../../shared/dtos/pagination-query.dto';
import { PaginatedResponseDto } from '../../../../../shared/dtos/paginated-response.dto';

export const IRequestService = Symbol('IRequestService');

export interface IRequestService {
  createRequest(
    dto: CreateRequestDto,
    productId: string,
    recipientId: string,
  ): Promise<Request>;

  acceptRequest(requestId: string, userId: string): Promise<void>;

  listMyRequests(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Request>>;

  listRequestsForProduct(
    productId: string,
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Request>>;

  listIncomingRequests(
    donorId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Request>>;

  rejectRequest(requestId: string, userId: string): Promise<void>;

  completeRequest(requestId: string, userId: string): Promise<void>;
}
