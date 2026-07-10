import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class PasswordResetMailService {
  private readonly logger = new Logger(PasswordResetMailService.name);
  private readonly transporter: Transporter | null;
  private readonly sender: string;
  private readonly resetUrl: string;

  constructor(configService: ConfigService) {
    const smtpUrl = configService.get<string>('SMTP_URL');
    this.transporter = smtpUrl ? nodemailer.createTransport(smtpUrl) : null;
    this.sender = configService.get<string>('SMTP_FROM') ?? 'no-reply@workmeter.local';
    this.resetUrl =
      configService.get<string>('PASSWORD_RESET_URL') ??
      'http://localhost:3000/reset-password';
  }

  async sendPasswordReset(email: string, token: string) {
    if (!this.transporter) {
      this.logger.error('SMTP_URL is required to send password reset email');
      throw new ServiceUnavailableException('Password reset email service is unavailable');
    }

    const link = `${this.resetUrl}?token=${encodeURIComponent(token)}`;
    await this.transporter.sendMail({
      from: this.sender,
      to: email,
      subject: 'Restablece tu contraseña de WorkMeter',
      text: `Abre este enlace para restablecer tu contraseña: ${link}`,
      html: `<p>Abre el siguiente enlace para restablecer tu contraseña:</p><p><a href="${link}">${link}</a></p>`,
    });
  }
}
