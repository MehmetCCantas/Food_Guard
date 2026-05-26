import {
  Body,
  Controller,
  Post,
  Inject,
  ValidationPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IAuthService } from '../../application/ports/in/auth.in-ports';
import { LoginDto } from '../dtos/login.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
import { VerifyPhoneDto } from '../dtos/verify-phone.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { User } from '../../../users/domain/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(IAuthService)
    private readonly authService: IAuthService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Logs in a user' })
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refreshes an access token using a refresh token' })
  async refreshToken(@Req() req): Promise<{ accessToken: string }> {
    const userId = req.user.userId;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshToken(userId, refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logs out a user' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: { user: User }): Promise<void> {
    const userId = req.user.id;
    await this.authService.logout(userId);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Sends a password reset email' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(
    @Body(ValidationPipe) dto: ForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Resets the password using a token' })
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: 'Password has been reset successfully' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Changes the password for a logged-in user' })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: { user: User },
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(req.user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Post('send-verification-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sends a 6-digit verification code to the logged-in user email' })
  @HttpCode(HttpStatus.OK)
  async sendVerificationEmail(@Req() req: { user: User }): Promise<{ message: string }> {
    await this.authService.sendVerificationEmail(req.user.id);
    return { message: 'Verification code sent' };
  }

  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verifies the users email with the 6-digit code' })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Req() req: { user: User },
    @Body(ValidationPipe) dto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    await this.authService.verifyEmail(req.user.id, dto.code);
    return { message: 'Email verified successfully' };
  }

  @Post('verify-phone')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verifies the users phone using Firebase ID token' })
  @HttpCode(HttpStatus.OK)
  async verifyPhone(
    @Req() req: { user: User },
    @Body(ValidationPipe) dto: VerifyPhoneDto,
  ): Promise<{ message: string }> {
    await this.authService.verifyPhone(req.user.id, dto.idToken);
    return { message: 'Phone verified successfully' };
  }

  @Post('send-phone-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sends a mock SMS code to the user' })
  @HttpCode(HttpStatus.OK)
  async sendPhoneVerification(@Req() req: { user: User }): Promise<{ message: string }> {
    await this.authService.sendPhoneVerification(req.user.id);
    return { message: 'Phone verification code sent' };
  }
}
