import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPhoneDto {
  @ApiProperty({ description: 'Firebase ID Token from successful phone auth' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
