import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../domain/entities/product.entity';
import { IProductRepository } from '../../application/ports/out/product.out-ports';
import { ProductOrmEntity } from './product.orm-entity';
import {
  ProductStatus,
  ProductCategory,
} from '../../domain/enums/product.enum';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly ormRepository: Repository<ProductOrmEntity>,
  ) {}

  private toDomain(ormEntity: ProductOrmEntity): Product {
    const product = new Product();
    Object.assign(product, ormEntity);
    product.warningMessage = ormEntity.warningMessage;
    return product;
  }

  private toOrm(domainEntity: Product): ProductOrmEntity {
    const ormEntity = new ProductOrmEntity();
    Object.assign(ormEntity, domainEntity);
    ormEntity.warningMessage = domainEntity.warningMessage;
    return ormEntity;
  }

  async save(product: Product, transactionManager?: any): Promise<Product> {
    const repository = transactionManager
      ? transactionManager.getRepository(ProductOrmEntity)
      : this.ormRepository;
    const ormEntity = this.toOrm(product);
    const savedOrmEntity = await repository.save(ormEntity);
    return this.toDomain(savedOrmEntity);
  }

  async findById(id: string): Promise<Product | null> {
    const ormEntity = await this.ormRepository.findOneBy({ id });
    if (!ormEntity) {
      return null;
    }
    return this.toDomain(ormEntity);
  }

  async findByDonorId(donorId: string): Promise<Product[]> {
    const ormEntities = await this.ormRepository.find({
      where: { donorId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomain.bind(this));
  }

  async findNearby(
    longitude: number,
    latitude: number,
    radiusMeters: number,
    limit: number,
    offset: number,
    category?: ProductCategory,
    search?: string,
  ): Promise<[Product[], number]> {
    // Haversine bounding box approximation (no PostGIS needed)
    const latDelta = radiusMeters / 111000;
    const lonDelta =
      radiusMeters / (111000 * Math.cos((latitude * Math.PI) / 180));

    const queryBuilder = this.ormRepository.createQueryBuilder('product');

    queryBuilder
      .where(
        '((product.latitude BETWEEN :minLat AND :maxLat AND product.longitude BETWEEN :minLon AND :maxLon) OR (product.latitude IS NULL OR product.longitude IS NULL)) AND product.status = :status',
        {
          minLat: latitude - latDelta,
          maxLat: latitude + latDelta,
          minLon: longitude - lonDelta,
          maxLon: longitude + lonDelta,
          status: ProductStatus.AVAILABLE,
        },
      );

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (search) {
      queryBuilder.andWhere('product.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder.orderBy('product.createdAt', 'DESC').skip(offset).take(limit);

    const [ormEntities, totalItems] = await queryBuilder.getManyAndCount();

    return [ormEntities.map(this.toDomain.bind(this)), totalItems];
  }

  async updateStatus(
    id: string,
    status: ProductStatus,
    transactionManager?: any,
  ): Promise<void> {
    const repository = transactionManager
      ? transactionManager.getRepository(ProductOrmEntity)
      : this.ormRepository;
    const result = await repository.update(id, { status });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Product with ID ${id} not found for status update`,
      );
    }
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.ormRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Product with ID ${id} not found for deletion`,
      );
    }
  }
}
