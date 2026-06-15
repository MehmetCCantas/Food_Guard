import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RequestStatus } from '../../domain/enums/request.enum';
import { ProductOrmEntity } from '../../../products/infrastructure/repositories/product.orm-entity';
import { UserOrmEntity } from '../../../users/infrastructure/repositories/user.orm-entity';

@Entity({ name: 'requests' })
@Index(['productId', 'recipientId'], {
  where: `"status" = '${RequestStatus.PENDING}'`,
  unique: true,
})
export class RequestOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  productId: string;

  @Column('uuid')
  @Index()
  recipientId: string;

  @Column('uuid')
  @Index()
  donorId: string;

  @Column({ type: 'enum', enum: RequestStatus })
  status: RequestStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  requestMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Relations (lazy-loaded via repository relations option) ─────
  @ManyToOne(() => ProductOrmEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'productId' })
  product?: ProductOrmEntity;

  @ManyToOne(() => UserOrmEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'recipientId' })
  recipient?: UserOrmEntity;
}
