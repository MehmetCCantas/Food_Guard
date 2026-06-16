import { ProductStatus, ProductCategory } from '../enums/product.enum';

export class Product {
  id: string;
  donorId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  status: ProductStatus;

  category: ProductCategory;

  latitude?: number;
  longitude?: number;

  city: string;
  district: string;
  warningMessage?: string;
  createdAt: Date;
  expiresAt?: Date;
}
