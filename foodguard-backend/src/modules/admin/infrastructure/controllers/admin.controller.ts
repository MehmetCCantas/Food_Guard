import {
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../users/domain/enums/user-status.enum';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { IAdminService } from '../../application/ports/in/admin.in-ports';
import { UserResponseDto } from '../../../users/infrastructure/dtos/user.response.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    @Inject(IAdminService)
    private readonly adminService: IAdminService,
  ) {}

  @Get('/users')
  @ApiOperation({ summary: 'Lists all users (Admin only)' })
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.adminService.getAllUsers();
    return users.map((u) => new UserResponseDto(u));
  }

  @Patch('/users/:userId/verify')
  @ApiOperation({ summary: 'Verifies an organizational user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to verify' })
  @UseInterceptors(ClassSerializerInterceptor)
  async verifyUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<UserResponseDto> {
    const verifiedUser = await this.adminService.verifyUser(userId);
    return new UserResponseDto(verifiedUser);
  }
}
