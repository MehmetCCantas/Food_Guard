import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository, IEmailService } from '../ports/out/auth.out-ports';
import { ForgotPasswordDto } from '../../infrastructure/dtos/forgot-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email.toLowerCase());

    if (!user) {
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expirationDate = new Date(Date.now() + 3600 * 1000);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expirationDate;
    await this.userRepository.save(user);

    await this.emailService.sendPasswordResetEmail(user.email, rawToken);
  }
}
