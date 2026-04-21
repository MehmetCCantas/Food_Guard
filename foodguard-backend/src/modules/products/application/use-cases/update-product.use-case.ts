import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductStatus } from '../../domain/enums/product.enum';
import { UpdateProductDto } from '../../infrastructure/dtos/update-product.dto';
import { IProductRepository } from '../ports/out/product.out-ports';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    productId: string,
    dto: UpdateProductDto,
    userId: string,
  ): Promise<Product> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.donorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this product',
      );
    }

    if (product.status !== ProductStatus.AVAILABLE) {
      throw new ConflictException('Only available products can be updated');
    }

    Object.assign(product, dto);

    if (dto.latitude && dto.longitude) {
      product.location = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }

    return this.productRepository.save(product);
  }
}
