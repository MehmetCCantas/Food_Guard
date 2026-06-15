import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../domain/enums/user-status.enum';

export class RegisterUserDto {
  @ApiProperty({ example: 'kaan@alkar.com' })
  @IsEmail({}, { message: 'Enter valid email.' })
  email: string;

  @ApiProperty({ example: 'Kaan Alkar' })
  @IsString()
  @IsNotEmpty({ message: 'Cannot be empty.' })
  fullName: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 char.' })
  password: string;

  @ApiProperty({ example: 'İstanbul' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Kadiköy' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.DONOR })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: '+905551234567' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
