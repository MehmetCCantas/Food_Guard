import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { IAdminService } from '../ports/in/admin.in-ports';
import { VerifyUserUseCase } from '../use-cases/verify-user.use-case';

@Injectable()
export class AdminService implements IAdminService {
  constructor(private readonly verifyUserUseCase: VerifyUserUseCase) {}

  async verifyUser(userId: string): Promise<User> {
    return this.verifyUserUseCase.execute(userId);
  }
}
