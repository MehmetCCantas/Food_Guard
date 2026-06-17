import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../../shared/dtos/pagination-query.dto';
import { ProductCategory } from '../../domain/enums/product.enum';

export class FindNearbyProductsDto extends PaginationQueryDto {
  @ApiProperty({ example: 41.0441, description: 'User latitude' })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: 29.0021, description: 'User longitude' })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude: number;

  @ApiProperty({ example: 5, description: 'Search radius in Kilometers' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20000)
  radiusKm: number;

  @ApiPropertyOptional({
    enum: ProductCategory,
    description: 'Filter by category',
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ description: 'Filter by title (e.g., "ekmek")' })
  @IsOptional()
  @IsString()
  search?: string;
}
