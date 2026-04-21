import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import {
  UserRole,
  VerificationStatus,
} from '../../domain/enums/user-status.enum';
import { MessageOrmEntity } from '../../../chat/infrastructure/persistence/orm-entities/message.orm-entity';

@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column({ nullable: true })
  addressText?: string;

  @Column({ type: 'double precision', nullable: true })
  locationLat?: number;

  @Column({ type: 'double precision', nullable: true })
  locationLon?: number;

  @Column({ type: 'enum', enum: VerificationStatus })
  verificationStatus: VerificationStatus;

  @Column({ type: 'float', default: 0 })
  ratingScore: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  passwordResetExpires?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MessageOrmEntity, (message) => message.sender)
  sentMessages: MessageOrmEntity[];

  @OneToMany(() => MessageOrmEntity, (message) => message.receiver)
  receivedMessages: MessageOrmEntity[];
}
