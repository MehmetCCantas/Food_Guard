import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRequestDto {
  @ApiPropertyOptional({
    example: 'Çok ihtiyacım var, teşekkür ederim!',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  message?: string;
}
