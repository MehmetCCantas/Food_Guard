import { LoginDto } from '../../../infrastructure/dtos/login.dto';
import { ForgotPasswordDto } from '../../../infrastructure/dtos/forgot-password.dto';
import { ResetPasswordDto } from '../../../infrastructure/dtos/reset-password.dto';

export const IAuthService = Symbol('IAuthService');

export interface IAuthService {
  login(
    command: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string }>;
  logout(userId: string): Promise<void>;
  forgotPassword(dto: ForgotPasswordDto): Promise<void>;
  resetPassword(dto: ResetPasswordDto): Promise<void>;
}
