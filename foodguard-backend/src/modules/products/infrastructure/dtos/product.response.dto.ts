import { Product } from '../../domain/entities/product.entity';

export class ProductResponseDto extends Product {
  constructor(partial: Partial<Product>) {
    super();
    Object.assign(this, partial);
  }
}
