import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction, AuditResult } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { LoginDto } from '../dto/login.dto';
import { JwtPayload } from '../types/jwt-payload.type';
import { createHash, randomBytes } from 'crypto';
import { PasswordResetMailService } from './password-reset-mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordResetMailService: PasswordResetMailService,
    private readonly audit: AuditLogService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || user.status !== 'ACTIVE') {
      await this.audit.record({ action: AuditAction.LOGIN, resource: 'User', result: AuditResult.FAILURE, metadata: { email: loginDto.email } });
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!validPassword) {
      await this.audit.record({ userId: user.id, action: AuditAction.LOGIN, resource: 'User', resourceId: user.id, result: AuditResult.FAILURE });
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        token: 'pending',
      },
    });
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      sessionId: session.id,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1d',
    });

    await this.prisma.session.update({
      where: { id: session.id },
      data: { token: accessToken },
    });

    await this.audit.record({ userId: user.id, action: AuditAction.LOGIN, resource: 'User', resourceId: user.id });
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    };
  }

  async logout(sessionId: number, userId: number) {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { expirationDate: new Date() },
    });
    await this.audit.record({ userId, action: AuditAction.LOGOUT, resource: 'Session', resourceId: sessionId });
    return { message: 'Session closed' };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, status: true, createdAt: true, role: { select: { name: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(userId: number, dto: { name?: string; email?: string }) {
    if (dto.email) { const existing = await this.prisma.user.findUnique({ where: { email: dto.email } }); if (existing && existing.id !== userId) throw new ConflictException('Email already exists'); }
    return this.prisma.user.update({ where: { id: userId }, data: dto, select: { id: true, name: true, email: true, status: true, createdAt: true, role: { select: { name: true } } } });
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string, sessionId: number) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) throw new BadRequestException('Current password is incorrect');
    const now = new Date(); const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }), this.prisma.session.updateMany({ where: { userId, id: { not: sessionId }, expirationDate: null }, data: { expirationDate: now } })]);
    await this.audit.record({ userId, action: AuditAction.PASSWORD_CHANGED, resource: 'User', resourceId: userId });
    return { message: 'Password updated successfully' };
  }

  async requestPasswordReset(email: string) {
    const response = {
      message: 'If the email is registered, a password reset link will be sent',
    };
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== 'ACTIVE') {
      return response;
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(token);
    const expirationMinutes = Number(
      this.configService.get('PASSWORD_RESET_EXPIRATION_MINUTES') ?? 30,
    );
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({
        where: { userId: user.id, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + expirationMinutes * 60000),
        },
      }),
    ]);
    await this.passwordResetMailService.sendPasswordReset(user.email, token);
    return response;
  }

  async validatePasswordResetToken(token: string) {
    const resetToken = await this.findValidResetToken(token);
    if (!resetToken) {
      throw new BadRequestException('Password reset token is invalid, expired, or already used');
    }
    return { valid: true, expiresAt: resetToken.expiresAt };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.findValidResetToken(token);
    if (!resetToken) {
      throw new BadRequestException('Password reset token is invalid, expired, or already used');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const now = new Date();
    await this.prisma.$transaction(async (transaction) => {
      const consumed = await transaction.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          consumedAt: null,
          expiresAt: { gt: now },
        },
        data: { consumedAt: now },
      });
      if (consumed.count !== 1) {
        throw new BadRequestException('Password reset token is invalid, expired, or already used');
      }
      await transaction.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });
      await transaction.session.updateMany({
        where: { userId: resetToken.userId, expirationDate: null },
        data: { expirationDate: now },
      });
    });
    return { message: 'Password updated successfully' };
  }

  private findValidResetToken(token: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash: this.hashResetToken(token),
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
