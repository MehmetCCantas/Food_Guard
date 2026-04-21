import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsLatitude,
  IsLongitude,
  IsNumber,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Fresh Bread (5 Loaves)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Fresh bread left over from closing.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'İstanbul' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Beşiktaş' })
  @IsOptional()
  @IsString()
  district?: string;

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
