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
import { ForgotPasswordDto } from '../dtos/forgot-password.dto'; // <-- YENİ IMPORT
import { ResetPasswordDto } from '../dtos/reset-password.dto'; // <-- YENİ IMPORT
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(
    @Body(ValidationPipe) dto: ResetPasswordDto,
  ): Promise<void> {
    return this.authService.resetPassword(dto);
  }
}
