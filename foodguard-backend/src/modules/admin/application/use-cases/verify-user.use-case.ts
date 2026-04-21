import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import {
  UserRole,
  VerificationStatus,
} from '../../../users/domain/enums/user-status.enum';
import { IUserRepository } from '../ports/out/admin.out-ports';

@Injectable()
export class VerifyUserUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.ORGANIZATIONAL_RECIPIENT) {
      throw new ConflictException(
        'Only organizational accounts can be verified',
      );
    }

    if (user.verificationStatus === VerificationStatus.VERIFIED) {
      throw new ConflictException('User is already verified');
    }

    user.verificationStatus = VerificationStatus.VERIFIED;
    user.updatedAt = new Date();

    return this.userRepository.save(user);
  }
}
