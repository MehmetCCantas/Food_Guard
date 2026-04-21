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
  Patch,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { IRequestService } from '../../application/ports/in/request.in-ports';
import { CreateRequestDto } from '../dtos/create-request.dto';
import { RequestResponseDto } from '../dtos/request.response.dto';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../users/domain/enums/user-status.enum';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { User } from '../../../users/domain/entities/user.entity';
import { PaginationQueryDto } from '../../../../shared/dtos/pagination-query.dto';
import { PaginatedResponseDto } from '../../../../shared/dtos/paginated-response.dto';
import { IdempotencyInterceptor } from '../../../../shared/interceptors/idempotency.interceptor'; // <-- YENİ IMPORT

@ApiTags('Requests')
@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RequestController {
  constructor(
    @Inject(IRequestService)
    private readonly requestService: IRequestService,
  ) {}

  @Post('/products/:productId')
  @Roles(UserRole.INDIVIDUAL_RECIPIENT, UserRole.ORGANIZATIONAL_RECIPIENT)
  @ApiOperation({
    summary: 'Submits a request for a specific listing (Recipient only)',
  })
  @UseInterceptors(IdempotencyInterceptor)
  async createRequest(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body(ValidationPipe) dto: CreateRequestDto,
    @Req() req: { user: User },
  ): Promise<RequestResponseDto> {
    const recipientId = req.user.id;
    const request = await this.requestService.createRequest(
      dto,
      productId,
      recipientId,
    );
    return new RequestResponseDto(request);
  }

  @Patch(':requestId/accept')
  @Roles(UserRole.DONOR)
  @ApiOperation({
    summary: 'Accepts a specific request (Must be the listing owner/Donor)',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(IdempotencyInterceptor)
  async acceptRequest(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Req() req: { user: User },
  ): Promise<void> {
    const userId = req.user.id;
    await this.requestService.acceptRequest(requestId, userId);
  }

  @Get('/my-requests')
  @Roles(UserRole.INDIVIDUAL_RECIPIENT, UserRole.ORGANIZATIONAL_RECIPIENT)
  @ApiOperation({
    summary: 'Lists all requests made by the logged-in user (Recipient only)',
  })
  async listMyRequests(
    @Req() req: { user: User },
    @Query(ValidationPipe) query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<RequestResponseDto>> {
    const userId = req.user.id;
    const paginatedResult = await this.requestService.listMyRequests(
      userId,
      query,
    );

    return {
      data: paginatedResult.data.map(
        (request) => new RequestResponseDto(request),
      ),
      meta: paginatedResult.meta,
    };
  }

  @Get('/incoming')
  @Roles(UserRole.DONOR)
  @ApiOperation({
    summary: 'Lists all incoming requests for the logged-in Donor',
  })
  async listIncomingRequests(
    @Req() req: { user: User },
    @Query(ValidationPipe) query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<RequestResponseDto>> {
    const userId = req.user.id;
    const paginatedResult = await this.requestService.listIncomingRequests(userId, query);

    return {
      data: paginatedResult.data.map((request) => new RequestResponseDto(request)),
      meta: paginatedResult.meta,
    };
  }

  @Get('/products/:productId')
  @Roles(UserRole.DONOR)
  @ApiOperation({
    summary:
      'Lists pending requests for a specific product (Must be the listing owner/Donor)',
  })
  async listRequestsForProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: { user: User },
    @Query(ValidationPipe) query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<RequestResponseDto>> {
    const userId = req.user.id;
    const paginatedResult = await this.requestService.listRequestsForProduct(
      productId,
      userId,
      query,
    );
    return {
      data: paginatedResult.data.map(
        (request) => new RequestResponseDto(request),
      ),
      meta: paginatedResult.meta,
    };
  }

  @Patch(':requestId/reject')
  @Roles(UserRole.DONOR)
  @ApiOperation({
    summary: 'Rejects a specific request (Must be the listing owner/Donor)',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(IdempotencyInterceptor)
  async rejectRequest(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Req() req: { user: User },
  ): Promise<void> {
    const userId = req.user.id;
    await this.requestService.rejectRequest(requestId, userId);
  }

  @Patch(':requestId/complete')
  @Roles(UserRole.INDIVIDUAL_RECIPIENT, UserRole.ORGANIZATIONAL_RECIPIENT)
  @ApiOperation({
    summary: 'Marks a request as completed (Must be the recipient)',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(IdempotencyInterceptor)
  async completeRequest(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Req() req: { user: User },
  ): Promise<void> {
    const userId = req.user.id;
    await this.requestService.completeRequest(requestId, userId);
  }
}
