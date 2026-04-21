import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  itemsPerPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;

  constructor(totalItems: number, page: number, limit: number) {
    this.totalItems = totalItems;
    this.itemsPerPage = limit;
    this.currentPage = page;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.itemCount = 0;
  }
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty()
  meta: PaginationMeta;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = new PaginationMeta(total, page, limit);
    this.meta.itemCount = data.length;
  }
}
