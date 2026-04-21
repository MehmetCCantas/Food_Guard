import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { INotificationService } from '../../application/ports/in/notification.in-ports';
import { Notification } from '../../domain/entities/notification.entity';
import { User } from '../../../users/domain/entities/user.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(
    @Inject(INotificationService)
    private readonly notificationService: INotificationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get my notification history' })
  async getMyNotifications(
    @Req() req: { user: User },
  ): Promise<Notification[]> {
    return this.notificationService.getMyNotifications(req.user.id);
  }
}
