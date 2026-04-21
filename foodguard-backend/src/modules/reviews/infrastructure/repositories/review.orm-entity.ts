import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'reviews' })
export class ReviewOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  @Index({ unique: true })
  requestId: string;

  @Column('uuid')
  @Index()
  recipientId: string;

  @Column('uuid')
  @Index()
  donorId: string;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}
