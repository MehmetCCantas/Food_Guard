import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ProductStatus,
  ProductCategory,
} from '../../domain/enums/product.enum';

@Entity({ name: 'products' })
export class ProductOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  donorId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'enum', enum: ProductStatus })
  status: ProductStatus;

  @Column({ type: 'enum', enum: ProductCategory })
  @Index()
  category: ProductCategory;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Column({ type: 'text', nullable: true })
  warningMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt?: Date;
}
