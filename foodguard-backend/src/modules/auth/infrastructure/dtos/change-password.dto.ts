import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!', description: 'Current password' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123!', description: 'New password' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}
