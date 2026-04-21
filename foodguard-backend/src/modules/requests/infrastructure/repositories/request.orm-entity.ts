import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RequestStatus } from '../../domain/enums/request.enum';

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
}
