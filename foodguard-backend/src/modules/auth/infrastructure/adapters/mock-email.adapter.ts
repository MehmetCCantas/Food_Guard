import { Injectable, Logger } from '@nestjs/common';
import { IEmailService } from '../../application/ports/out/auth.out-ports';

@Injectable()
export class MockEmailAdapter implements IEmailService {
  private readonly logger = new Logger(MockEmailAdapter.name);

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    this.logger.warn(`--- MOCK EMAIL SENT ---`);
    this.logger.log(`To: ${email}`);
    this.logger.log(`Password Reset Token: ${token}`);
    this.logger.warn(`-------------------------`);

    return Promise.resolve();
  }
}
