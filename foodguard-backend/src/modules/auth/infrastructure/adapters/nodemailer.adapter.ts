import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import axios from 'axios';
import { IEmailService } from '../../application/ports/out/auth.out-ports';

@Injectable()
export class NodemailerAdapter implements IEmailService {
  private readonly logger = new Logger(NodemailerAdapter.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly resendApiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY');

    if (this.resendApiKey) {
      this.logger.log('🚀 Using Resend API for sending emails (production mode)');
    } else {
      this.logger.warn('⚠️ RESEND_API_KEY not set — falling back to Gmail SMTP');
      this.transporter = nodemailer.createTransport(<SMTPTransport.Options>{
        host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
        port: this.configService.get<number>('MAIL_PORT', 587),
        secure: false,
        family: 4, // Force IPv4 — Railway IPv6 cannot reach Gmail SMTP
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASS'),
        },
      });

      this.transporter.verify((error) => {
        if (error) {
          this.logger.error('❌ Email transporter connection failed:', error.message);
        } else {
          this.logger.log('✅ Email transporter is ready to send messages');
        }
      });
    }
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const from = this.configService.get<string>('MAIL_FROM', 'FoodGuard <noreply.foodguard@gmail.com>');

    if (this.resendApiKey) {
      try {
        const response = await axios.post(
          'https://api.resend.com/emails',
          { from, to, subject, html },
          {
            headers: {
              Authorization: `Bearer ${this.resendApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        );
        this.logger.log(`✅ Email sent via Resend API to: ${to} (id: ${response.data?.id})`);
      } catch (error: any) {
        const errData = error.response?.data || error.message;
        this.logger.error(`❌ Resend API failed for ${to}: ${JSON.stringify(errData)}`);
        throw error;
      }
    } else if (this.transporter) {
      await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`✅ Email sent via Gmail SMTP to: ${to}`);
    } else {
      throw new Error('No email provider configured');
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
            .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 36px 32px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
            .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
            .body { padding: 36px 32px; }
            .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #16a34a, #15803d); color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 8px 0 24px; }
            .footer { background: #f9fafb; padding: 20px 32px; text-align: center; }
            .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌿 FoodGuard</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="body">
              <p>Hi there,</p>
              <p>We received a request to reset the password for your FoodGuard account. Click the button below to set a new password:</p>
              <a href="${resetUrl}" class="btn">Reset My Password</a>
              <p>This link will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} FoodGuard. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.send(email, '🔑 Reset Your FoodGuard Password', html);
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
            .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 36px 32px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
            .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
            .body { padding: 36px 32px; text-align: center; }
            .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; text-align: left; }
            .code-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 24px; margin: 24px 0; }
            .code { font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #15803d; font-family: 'Courier New', monospace; }
            .expiry { color: #9ca3af; font-size: 13px; margin-top: 8px; }
            .footer { background: #f9fafb; padding: 20px 32px; text-align: center; }
            .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌿 FoodGuard</h1>
              <p>Email Verification</p>
            </div>
            <div class="body">
              <p>Hi there,</p>
              <p>Use the verification code below to confirm your email address. Enter it in the FoodGuard app to complete your verification.</p>
              <div class="code-box">
                <div class="code">${code}</div>
                <div class="expiry">⏱ This code expires in 15 minutes</div>
              </div>
              <p style="font-size:13px; color:#9ca3af;">If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} FoodGuard. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.send(email, '✅ Your FoodGuard Verification Code', html);
  }
}
