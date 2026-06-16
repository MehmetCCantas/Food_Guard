import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { LoginDto } from '../../infrastructure/dtos/login.dto';
import { ForgotPasswordDto } from '../../infrastructure/dtos/forgot-password.dto';
import { ResetPasswordDto } from '../../infrastructure/dtos/reset-password.dto';
import { ChangePasswordDto } from '../../infrastructure/dtos/change-password.dto';
import { IAuthService } from '../ports/in/auth.in-ports';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { ForgotPasswordUseCase } from '../use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case';
import { IUserRepository, IHashingService, IEmailService } from '../ports/out/auth.out-ports';
import { VerificationStatus } from '../../../users/domain/enums/user-status.enum';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IHashingService)
    private readonly hashingService: IHashingService,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.loginUseCase.execute(dto);
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    return this.refreshTokenUseCase.execute(userId, refreshToken);
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    return this.forgotPasswordUseCase.execute(dto);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    return this.resetPasswordUseCase.execute(dto);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await this.hashingService.comparePassword(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Incorrect current password');
    }

    user.passwordHash = await this.hashingService.hashPassword(dto.newPassword);
    await this.userRepository.save(user);
  }

  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.isEmailVerified) return;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = code;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await this.userRepository.save(user);

    await this.emailService.sendVerificationCode(user.email, code);
  }


  async verifyEmail(userId: string, code: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    
    if (user.emailVerificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }
    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Verification code expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    
    if (user.isEmailVerified && user.isPhoneVerified) {
        user.verificationStatus = VerificationStatus.VERIFIED;
    }
    
    await this.userRepository.save(user);
  }

  async verifyPhone(userId: string, idToken: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // DEV MODE BYPASS: If in development mode and the token is 'mock-phone-token', verify immediately
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && idToken === 'mock-phone-token') {
      console.warn(`💡 [DEV MODE BYPASS] Bypassing phone verification for user: ${userId}`);
      user.isPhoneVerified = true;
      user.phoneVerificationCode = undefined;
      if (user.isEmailVerified && user.isPhoneVerified) {
        user.verificationStatus = VerificationStatus.VERIFIED;
      }
      await this.userRepository.save(user);
      return;
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken.phone_number) {
        throw new BadRequestException('Phone number is missing in Firebase token');
      }
      user.isPhoneVerified = true;
      user.phoneVerificationCode = undefined;
      if (user.isEmailVerified && user.isPhoneVerified) {
        user.verificationStatus = VerificationStatus.VERIFIED;
      }
      await this.userRepository.save(user);
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid Firebase phone token: ' + error.message);
    }
  }

  async sendPhoneVerification(userId: string): Promise<void> {
    // Firebase Phone Auth: SMS is sent directly from the frontend via Firebase JS SDK.
    // This endpoint is kept for compatibility but the real SMS flow is handled client-side.
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.isPhoneVerified) return;
    // No-op: frontend handles SMS sending via Firebase SDK
  }
}
