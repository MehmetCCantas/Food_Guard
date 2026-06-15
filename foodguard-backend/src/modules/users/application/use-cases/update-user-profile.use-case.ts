import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../../infrastructure/dtos/update-user.dto';
import { IHashingService, IUserRepository } from '../ports/out/user.out-port';
import { VerificationStatus } from '../../domain/enums/user-status.enum';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IHashingService)
    private readonly hashingService: IHashingService,
  ) {}

  async execute(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existingUser = await this.userRepository.findByEmail(
        dto.email.toLowerCase(),
      );
      if (existingUser) {
        throw new ConflictException('Email is already in use');
      }
      user.email = dto.email.toLowerCase();
      // Email changed → require re-verification
      user.isEmailVerified = false;
      user.verificationStatus = VerificationStatus.UNVERIFIED;
    }

    if (dto.password) {
      user.passwordHash = await this.hashingService.hashPassword(dto.password);
    }

    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.city) user.city = dto.city;
    if (dto.district) user.district = dto.district;
    if (dto.addressText) user.addressText = dto.addressText;

    // Phone number changed → reset verification
    if (dto.phoneNumber !== undefined && dto.phoneNumber !== user.phoneNumber) {
      user.phoneNumber = dto.phoneNumber;
      user.isPhoneVerified = false;
      user.verificationStatus = VerificationStatus.UNVERIFIED;
    }

    if (dto.latitude && dto.longitude) {
      user.location = { lat: dto.latitude, lon: dto.longitude };
    }

    user.updatedAt = new Date();

    return this.userRepository.save(user);
  }
}
