import { User } from '../../../domain/entities/user.entity';
import { RegisterUserDto } from '../../../infrastructure/dtos/register-user.dto';
import { UpdateUserDto } from '../../../infrastructure/dtos/update-user.dto';

export const IUserService = Symbol('IUserService');

export interface IUserService {
  registerUser(registerUserDto: RegisterUserDto): Promise<User>;

  getUserProfile(userId: string): Promise<User>;

  updateUserProfile(userId: string, dto: UpdateUserDto): Promise<User>;
}
