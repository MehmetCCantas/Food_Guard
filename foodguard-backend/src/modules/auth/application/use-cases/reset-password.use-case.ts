import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository, IHashingService } from '../ports/out/auth.out-ports';
import { ResetPasswordDto } from '../../infrastructure/dtos/reset-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IHashingService)
    private readonly hashingService: IHashingService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = dto;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user =
      await this.userRepository.findByPasswordResetToken(hashedToken);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const newPasswordHash = await this.hashingService.hashPassword(newPassword);

    user.passwordHash = newPasswordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.updatedAt = new Date();

    await this.userRepository.save(user);
  }
}
