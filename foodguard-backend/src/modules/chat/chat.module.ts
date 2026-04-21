import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageOrmEntity } from './infrastructure/persistence/orm-entities/message.orm-entity';
import { UserOrmEntity } from '../users/infrastructure/repositories/user.orm-entity';
import { ChatGateway } from './infrastructure/gateways/chat.gateway';
import { ChatController } from './infrastructure/controllers/chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MessageOrmEntity, UserOrmEntity])],
  controllers: [ChatController],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
