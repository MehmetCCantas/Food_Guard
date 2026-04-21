import { Injectable, Inject } from '@nestjs/common';
import { LoginDto } from '../../infrastructure/dtos/login.dto';
import { ForgotPasswordDto } from '../../infrastructure/dtos/forgot-password.dto';
import { ResetPasswordDto } from '../../infrastructure/dtos/reset-password.dto';
import { IAuthService } from '../ports/in/auth.in-ports';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { ForgotPasswordUseCase } from '../use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case';
import { IUserRepository } from '../ports/out/auth.out-ports';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
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
}
