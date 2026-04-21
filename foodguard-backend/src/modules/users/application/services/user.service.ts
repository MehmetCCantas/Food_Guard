import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { RegisterUserDto } from '../../infrastructure/dtos/register-user.dto';
import { UpdateUserDto } from '../../infrastructure/dtos/update-user.dto';
import { IUserService } from '../ports/in/user.in-port';
import { RegisterUserUseCase } from '../use-cases/register-user.use-case';
import { GetUserProfileUseCase } from '../use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../use-cases/update-user-profile.use-case';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  async registerUser(dto: RegisterUserDto): Promise<User> {
    return this.registerUserUseCase.execute(dto);
  }

  async getUserProfile(userId: string): Promise<User> {
    return this.getUserProfileUseCase.execute(userId);
  }

  async updateUserProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    return this.updateUserProfileUseCase.execute(userId, dto);
  }
}
