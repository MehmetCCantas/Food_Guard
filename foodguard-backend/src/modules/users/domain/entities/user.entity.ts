import { UserRole, VerificationStatus } from '../enums/user-status.enum';

export class User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  city: string;
  district: string;
  addressText?: string;
  location?: { lat: number; lon: number };
  verificationStatus: VerificationStatus;
  ratingScore: number;
  ratingCount: number;
  hashedRefreshToken?: string;

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  emailVerificationCode?: string;
  emailVerificationExpires?: Date;

  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  phoneVerificationCode?: string;

  createdAt: Date;
  updatedAt: Date;
}
