import { Exclude } from 'class-transformer';
import { User } from '../../domain/entities/user.entity';
import {
  UserRole,
  VerificationStatus,
} from '../../domain/enums/user-status.enum';

export class UserResponseDto {
  id: string;
  email: string;

  @Exclude()
  passwordHash: string;

  fullName: string;
  role: UserRole;
  city: string;
  district: string;
  addressText?: string;
  location?: { lat: number; lon: number };
  verificationStatus: VerificationStatus;
  ratingScore: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
