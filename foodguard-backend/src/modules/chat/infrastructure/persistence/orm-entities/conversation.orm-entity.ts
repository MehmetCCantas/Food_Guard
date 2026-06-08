import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from '../../../../users/infrastructure/repositories/user.orm-entity';
import { ProductOrmEntity } from '../../../../products/infrastructure/repositories/product.orm-entity';

@Entity({ name: 'conversations' })
export class ConversationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  product?: ProductOrmEntity;

  @Column({ type: 'uuid', nullable: true })
  productId?: string;

  @ManyToOne(() => UserOrmEntity)
  participant1: UserOrmEntity;

  @Column({ type: 'uuid' })
  participant1Id: string;

  @ManyToOne(() => UserOrmEntity)
  participant2: UserOrmEntity;

  @Column({ type: 'uuid' })
  participant2Id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
