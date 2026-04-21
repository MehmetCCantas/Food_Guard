import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ProductStatus } from '../../domain/enums/product.enum';
import { IProductRepository } from '../ports/out/product.out-ports';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(productId: string, userId: string): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.donorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this product',
      );
    }

    if (product.status !== ProductStatus.AVAILABLE) {
      throw new ConflictException('Only available products can be deleted');
    }

    await this.productRepository.deleteById(productId);
  }
}
