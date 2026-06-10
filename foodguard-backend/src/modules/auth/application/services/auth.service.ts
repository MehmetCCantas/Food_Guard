import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
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

    // ==========================================
    // FIREBASE GERÇEK SMS DOĞRULAMASI (YORUMA ALINDI)
    // ==========================================
    /*
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
      } catch (err) {
        throw new InternalServerErrorException('Firebase Admin not initialized properly.');
      }
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken.phone_number) {
        throw new BadRequestException('Phone number is missing in token');
      }
      user.isPhoneVerified = true;
      if (user.isEmailVerified && user.isPhoneVerified) {
          user.verificationStatus = VerificationStatus.VERIFIED;
      }
      await this.userRepository.save(user);
    } catch (error: any) {
      throw new BadRequestException('Invalid phone verification token: ' + error.message);
    }
    */

    // ==========================================
    // MOCK (SAHTE) SMS DOĞRULAMASI
    // ==========================================
    if (user.phoneVerificationCode !== idToken) { // idToken field'ini geçici olarak kod taşıyıcı olarak kullanıyoruz
      throw new BadRequestException('Invalid SMS verification code');
    }
    
    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined; // Opsiyonel: UserOrmEntity'ye phoneVerificationCode eklenebilir. Şimdilik emailVerificationCode gibi kullanıyoruz.
    
    if (user.isEmailVerified && user.isPhoneVerified) {
        user.verificationStatus = VerificationStatus.VERIFIED;
    }
    
    await this.userRepository.save(user);
  }

  async sendPhoneVerification(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.isPhoneVerified) return;

    // Firebase yerine mock SMS kodu üretiyoruz
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Geçici olarak emailVerificationCode alanını veya any/yeni eklenecek alanı kullanabiliriz.
    // user.entity'e phoneVerificationCode eklenecek.
    (user as any).phoneVerificationCode = code; 
    await this.userRepository.save(user);

    console.log(`\n=========================================\n`);
    console.log(`📱 [MOCK SMS] To: ${user.phoneNumber || 'User Phone'}`);
    console.log(`Your SMS Verification Code: ${code}`);
    console.log(`\n=========================================\n`);
  }
}
