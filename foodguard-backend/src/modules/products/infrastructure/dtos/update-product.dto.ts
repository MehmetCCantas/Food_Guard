import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ProductCategory } from '../../domain/enums/product.enum';

enum StorageCondition {
  FRIDGE = 'fridge',
  ROOM_TEMP = 'room_temp',
  UNKNOWN = 'unknown',
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Fresh Bread (5 Loaves)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Fresh bread left over from closing.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProductCategory })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ example: 'İstanbul' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Beşiktaş' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'Cihangir' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'Next to the pink building' })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiPropertyOptional({ example: 'Atatürk Cad. No:1' })
  @IsOptional()
  @IsString()
  addressLine?: string;

  @ApiPropertyOptional({ example: '34000' })
  @IsOptional()
  @IsString()
  postcode?: string;

  @ApiPropertyOptional({ example: 'Ring the bell on the left' })
  @IsOptional()
  @IsString()
  directions?: string;

  @ApiPropertyOptional({ enum: StorageCondition })
  @IsOptional()
  @IsString()
  storageCondition?: string;

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  @IsNumber()
  storageDurationHours?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasSmellChange?: boolean;

  @ApiPropertyOptional({ example: 41.0442 })
  @IsOptional()
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ example: 29.0022 })
  @IsOptional()
  @IsNumber()
  @IsLongitude()
  longitude?: number;
}
