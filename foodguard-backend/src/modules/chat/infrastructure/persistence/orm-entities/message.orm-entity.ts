import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserOrmEntity } from '../../../../users/infrastructure/repositories/user.orm-entity';
import { ConversationOrmEntity } from './conversation.orm-entity';

@Entity({ name: 'messages' })
export class MessageOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserOrmEntity, (user) => user.sentMessages)
  sender: UserOrmEntity;

  @ManyToOne(() => UserOrmEntity, (user) => user.receivedMessages)
  receiver: UserOrmEntity;

  @Column()
  senderId: string;

  @Column()
  receiverId: string;

  @ManyToOne(() => ConversationOrmEntity, { onDelete: 'CASCADE', nullable: true })
  conversation?: ConversationOrmEntity;

  @Column({ type: 'uuid', nullable: true })
  conversationId?: string;
}
