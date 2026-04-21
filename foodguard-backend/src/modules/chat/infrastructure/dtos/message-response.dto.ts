import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Selam, ilan hala güncel mi?' })
  content: string;

  @ApiProperty({ example: '2026-03-24T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: 'USER_ID_1' })
  senderId: string;

  @ApiProperty({ example: 'USER_ID_2' })
  receiverId: string;

  @ApiProperty({ example: false })
  isRead: boolean;
}
