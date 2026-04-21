import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';

import { IAuthService } from './application/ports/in/auth.in-ports';
import {
  IJwtService,
  IEmailService,
} from './application/ports/out/auth.out-ports';
import { AuthService } from './application/services/auth.service';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';

import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtAdapter } from './infrastructure/adapters/jwt.adapter';
import { MockEmailAdapter } from './infrastructure/adapters/mock-email.adapter';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { JwtRefreshGuard } from './infrastructure/guards/jwt-refresh.guard';

@Global()
@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    RolesGuard,
    JwtRefreshGuard,
    {
      provide: IAuthService,
      useClass: AuthService,
    },
    {
      provide: IJwtService,
      useClass: JwtAdapter,
    },
    {
      provide: IEmailService,
      useClass: MockEmailAdapter,
    },
  ],
  exports: [JwtAuthGuard, RolesGuard, PassportModule, JwtRefreshGuard],
})
export class AuthModule {}
