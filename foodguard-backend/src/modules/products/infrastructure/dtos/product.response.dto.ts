import { Product } from '../../domain/entities/product.entity';

export class ProductResponseDto extends Product {
  latitude?: number;
  longitude?: number;

  constructor(partial: Partial<Product>) {
    super();
    Object.assign(this, partial);
    
    // Normalize location to flat latitude and longitude for frontend compatibility
    if (partial.location && partial.location.coordinates) {
      this.longitude = partial.location.coordinates[0];
      this.latitude = partial.location.coordinates[1];
    }
  }
}
