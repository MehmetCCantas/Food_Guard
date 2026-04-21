import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { FindNearbyProductsDto } from '../../infrastructure/dtos/find-nearby-products.dto';
import { IProductRepository } from '../ports/out/product.out-ports';
import { PaginatedResponseDto } from '../../../../shared/dtos/paginated-response.dto';

@Injectable()
export class FindNearbyProductsUseCase {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    dto: FindNearbyProductsDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const {
      latitude,
      longitude,
      radiusKm,
      limit,
      page,
      offset,
      category,
      search,
    } = dto;

    const radiusMeters = radiusKm * 1000;

    const [products, totalItems] = await this.productRepository.findNearby(
      longitude,
      latitude,
      radiusMeters,
      limit,
      offset,
      category,
      search,
    );

    return new PaginatedResponseDto(products, totalItems, page, limit);
  }
}
