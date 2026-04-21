import {
  Body,
  Controller,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { IReviewService } from '../../application/ports/in/review.in-ports';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { ReviewResponseDto } from '../dtos/review.response.dto';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../users/domain/enums/user-status.enum';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { User } from '../../../users/domain/entities/user.entity';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReviewController {
  constructor(
    @Inject(IReviewService)
    private readonly reviewService: IReviewService,
  ) {}

  @Post('/request/:requestId')
  @Roles(UserRole.INDIVIDUAL_RECIPIENT, UserRole.ORGANIZATIONAL_RECIPIENT)
  @ApiOperation({
    summary: 'Submits a review for a completed request (Recipient only)',
  })
  async createReview(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body(ValidationPipe) dto: CreateReviewDto,
    @Req() req: { user: User },
  ): Promise<ReviewResponseDto> {
    const userId = req.user.id;

    const review = await this.reviewService.createReview(
      dto,
      requestId,
      userId,
    );
    return new ReviewResponseDto(review);
  }
}
