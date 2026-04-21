import { Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { TaskService } from '../../application/services/task.service';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../users/domain/enums/user-status.enum';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

@ApiTags('Admin Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('trigger-expiration')
  @ApiOperation({ summary: 'Süresi geçmiş ilanları manuel olarak temizler' })
  @ApiResponse({
    status: 201,
    schema: {
      example: { message: 'İşlem tamamlandı', affectedCount: 5 },
    },
  })
  async triggerExpiration() {
    const count = await this.taskService.processExpiredProducts();
    return { message: 'İşlem tamamlandı', affectedCount: count };
  }
}
