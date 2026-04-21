import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';

import { IAdminService } from './application/ports/in/admin.in-ports';
import { AdminService } from './application/services/admin.service';
import { VerifyUserUseCase } from './application/use-cases/verify-user.use-case';

import { AdminController } from './infrastructure/controllers/admin.controller';

@Module({
  imports: [UserModule],
  controllers: [AdminController],
  providers: [
    VerifyUserUseCase,
    {
      provide: IAdminService,
      useClass: AdminService,
    },
  ],
})
export class AdminModule {}
