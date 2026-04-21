import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

import { IUserService } from './application/ports/in/user.in-port';
import {
  IHashingService,
  IUserRepository,
} from './application/ports/out/user.out-port';
import { UserService } from './application/services/user.service';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';

import { UserController } from './infrastructure/controllers/user.controller';
import { BcryptAdapter } from './infrastructure/adapters/bcrypt.adapter';
import { UserOrmEntity } from './infrastructure/repositories/user.orm-entity';
import { UserRepository } from './infrastructure/repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    RegisterUserUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    {
      provide: IUserService,
      useClass: UserService,
    },
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IHashingService,
      useClass: BcryptAdapter,
    },
  ],
  exports: [IUserRepository, IHashingService],
})
export class UserModule {}
