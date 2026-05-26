import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { IProductService } from '../../application/ports/in/product.in-ports';
import { CreateProductDto } from '../dtos/create-product.dto';
import { ProductResponseDto } from '../dtos/product.response.dto';
import { FindNearbyProductsDto } from '../dtos/find-nearby-products.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { UserRole } from '../../../users/domain/enums/user-status.enum';
import { User } from '../../../users/domain/entities/user.entity';
import { PaginatedResponseDto } from '../../../../shared/dtos/paginated-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdempotencyInterceptor } from '../../../../shared/interceptors/idempotency.interceptor';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    @Inject(IProductService)
    private readonly productService: IProductService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Creates a new food listing (Donor only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The image file (.jpg, .png) of the product',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        category: {
          type: 'string',
          enum: ['BAKERY', 'VEGETABLE', 'MEAT', 'DRY_FOOD', 'OTHER'],
        },
        city: { type: 'string' },
        district: { type: 'string' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        storageCondition: {
          type: 'string',
          enum: ['fridge', 'room_temp', 'unknown'],
        },
        storageDurationHours: { type: 'number' },
        hasSmellChange: { type: 'boolean' },
      },
    },
  })
  @Roles(UserRole.DONOR)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    IdempotencyInterceptor,
    ClassSerializerInterceptor,
    FileInterceptor('file'),
  )
  async createProduct(
    @Body(ValidationPipe) dto: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5 MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: { user: User },
  ): Promise<ProductResponseDto> {
    const userId = req.user.id;
    const product = await this.productService.createProduct(dto, userId, file);
    return new ProductResponseDto(product);
  }

  @Get('nearby')
  @ApiOperation({
    summary: 'Lists available food listings nearby (Recipient only)',
  })
  @Roles(UserRole.INDIVIDUAL_RECIPIENT, UserRole.ORGANIZATIONAL_RECIPIENT, UserRole.DONOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findNearby(
    @Query(ValidationPipe) dto: FindNearbyProductsDto,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    const paginatedResult = await this.productService.findNearbyProducts(dto);
    return {
      data: paginatedResult.data.map(
        (product) => new ProductResponseDto(product),
      ),
      meta: paginatedResult.meta,
    };
  }

  @Get('my-donations')
  @ApiOperation({
    summary: 'Lists all food listings created by the logged-in donor',
  })
  @Roles(UserRole.DONOR)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getMyDonations(
    @Req() req: { user: User },
  ): Promise<ProductResponseDto[]> {
    const userId = req.user.id;
    const products = await this.productService.getMyProducts(userId);
    return products.map((product) => new ProductResponseDto(product));
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Gets the details of a specific food listing' })
  @ApiParam({
    name: 'productId',
    description: 'The ID of the product',
    type: 'string',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getProductById(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productService.getProductById(productId);
    return new ProductResponseDto(product);
  }

  @Patch(':productId')
  @ApiOperation({
    summary: 'Updates a food listing (Must be the owner & Donor)',
  })
  @Roles(UserRole.DONOR)
  @ApiParam({
    name: 'productId',
    description: 'The ID of the product to update',
    type: 'string',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(IdempotencyInterceptor, ClassSerializerInterceptor)
  async updateProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body(ValidationPipe) dto: UpdateProductDto,
    @Req() req: { user: User },
  ): Promise<ProductResponseDto> {
    const userId = req.user.id;
    const updatedProduct = await this.productService.updateProduct(
      productId,
      dto,
      userId,
    );
    return new ProductResponseDto(updatedProduct);
  }

  @Delete(':productId')
  @ApiOperation({
    summary: 'Deletes a food listing (Must be the owner & Donor)',
  })
  @Roles(UserRole.DONOR)
  @ApiParam({
    name: 'productId',
    description: 'The ID of the product to delete',
    type: 'string',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: { user: User },
  ): Promise<void> {
    const userId = req.user.id;
    await this.productService.deleteProduct(productId, userId);
  }
}
