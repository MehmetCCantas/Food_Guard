import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'kaanalkar@test.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
