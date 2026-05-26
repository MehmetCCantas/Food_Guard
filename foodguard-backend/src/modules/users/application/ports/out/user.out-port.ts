import { User } from '../../../domain/entities/user.entity';

export const IUserRepository = Symbol('IUserRepository');

export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  updateUserRating(userId: string, newRating: number): Promise<void>;
  updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void>;

  findByPasswordResetToken(token: string): Promise<User | null>;
}

export const IHashingService = Symbol('IHashingService');

export interface IHashingService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}
