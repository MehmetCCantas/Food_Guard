import { LoginDto } from '../../../infrastructure/dtos/login.dto';
import { ForgotPasswordDto } from '../../../infrastructure/dtos/forgot-password.dto';
import { ResetPasswordDto } from '../../../infrastructure/dtos/reset-password.dto';
import { ChangePasswordDto } from '../../../infrastructure/dtos/change-password.dto';

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
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
  sendVerificationEmail(userId: string): Promise<void>;
  verifyEmail(userId: string, code: string): Promise<void>;
  sendPhoneVerification(userId: string): Promise<void>;
  verifyPhone(userId: string, idToken: string): Promise<void>;
}
