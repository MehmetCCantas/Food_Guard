import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { IAdminService } from '../ports/in/admin.in-ports';
import { VerifyUserUseCase } from '../use-cases/verify-user.use-case';
import { GetAllUsersUseCase } from '../use-cases/get-all-users.use-case';

@Injectable()
export class AdminService implements IAdminService {
  constructor(
    private readonly verifyUserUseCase: VerifyUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
  ) {}

  async verifyUser(userId: string): Promise<User> {
    return this.verifyUserUseCase.execute(userId);
  }

  async getAllUsers(): Promise<User[]> {
    return this.getAllUsersUseCase.execute();
  }
}
