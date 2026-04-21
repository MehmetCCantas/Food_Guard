import {
  Body,
  Controller,
  Post,
  Inject,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  UseGuards,
  Req,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { IUserService } from '../../application/ports/in/user.in-port';
import { UserResponseDto } from '../dtos/user.response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../../domain/entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    @Inject(IUserService)
    private readonly userService: IUserService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Creates a new user account' })
  @UseInterceptors(ClassSerializerInterceptor)
  async register(
    @Body(ValidationPipe) registerUserDto: RegisterUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.registerUser(registerUserDto);
    return new UserResponseDto(user);
  }

  @Get('me')
  @ApiOperation({ summary: 'Gets the logged-in user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getProfile(@Req() req: { user: User }): Promise<UserResponseDto> {
    return new UserResponseDto(req.user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Updates the logged-in user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateProfile(
    @Req() req: { user: User },
    @Body(new ValidationPipe({ skipMissingProperties: true }))
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const userId = req.user.id;
    const updatedUser = await this.userService.updateUserProfile(userId, dto);
    return new UserResponseDto(updatedUser);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Gets public profile of another user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getPublicProfile(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.getUserProfile(id);
    return new UserResponseDto(user);
  }
}
