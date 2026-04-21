import { PaginationQueryDto } from '../../../../shared/dtos/pagination-query.dto';

export class ListMyRequestsDto extends PaginationQueryDto {
  userId: string;
}

export class ListRequestsForProductDto extends PaginationQueryDto {
  userId: string;
  productId: string;
}
