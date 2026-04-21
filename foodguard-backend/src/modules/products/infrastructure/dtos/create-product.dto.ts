import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsLongitude,
  IsLatitude,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ProductCategory } from '../../domain/enums/product.enum';

export enum StorageCondition {
  FRIDGE = 'fridge',
  ROOM_TEMP = 'room_temp',
  UNKNOWN = 'unknown',
}

export class CreateProductDto {
  @ApiProperty({ example: 'Bayatlamaya Yakın Ekmekler (5 Adet)' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Akşam kapanıştan kalan taze ekmekler.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ProductCategory, example: 'BAKERY' })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({ example: 'İstanbul' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Beşiktaş' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 41.0441 })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: 29.0021 })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude: number;

  @ApiProperty({ enum: StorageCondition, example: 'room_temp' })
  @IsEnum(StorageCondition)
  storageCondition: StorageCondition;

  @ApiProperty({
    example: 4,
    description: 'How many hours ago was it prepared?',
  })
  @Type(() => Number)
  @IsNumber()
  storageDurationHours: number;

  @ApiProperty({ example: false, description: 'Is there any change in smell?' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasSmellChange: boolean;
}
