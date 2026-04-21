import { Product } from '../../../domain/entities/product.entity';
import { ProductStatus } from '../../../domain/enums/product.enum';
import { EntityManager } from 'typeorm';

export const IProductRepository = Symbol('IProductRepository');

export interface IProductRepository {
  save(product: Product, transactionManager?: EntityManager): Promise<Product>; // <-- GÜNCELLENDİ
  findById(id: string): Promise<Product | null>;
  findByDonorId(donorId: string): Promise<Product[]>;
  findNearby(
    longitude: number,
    latitude: number,
    radiusMeters: number,
    limit: number,
    offset: number,
    category?: any,
    search?: string,
  ): Promise<[Product[], number]>;

  updateStatus(
    id: string,
    status: ProductStatus,
    transactionManager?: EntityManager,
  ): Promise<void>;

  deleteById(id: string): Promise<void>;
}
