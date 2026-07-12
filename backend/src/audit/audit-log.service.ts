import { Injectable, Logger } from '@nestjs/common';
import { AuditAction, AuditResult, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AuditContext = { userId?: number; ipAddress?: string; userAgent?: string };
export type AuditInput = AuditContext & { action: AuditAction; resource: string; resourceId?: number | string; result?: AuditResult; metadata?: Record<string, unknown> };

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditInput): Promise<void> {
    try {
      const safeMetadata = input.metadata ? this.sanitize(input.metadata) : undefined;
      await this.prisma.auditLog.create({ data: {
        userId: input.userId, action: input.action, resource: input.resource,
        resourceId: input.resourceId === undefined ? undefined : String(input.resourceId),
        ipAddress: input.ipAddress?.slice(0, 64), userAgent: input.userAgent?.slice(0, 255),
        result: input.result ?? AuditResult.SUCCESS,
        metadata: safeMetadata as Prisma.InputJsonValue | undefined,
      } });
    } catch (error) {
      this.logger.warn(`Audit recording failed for ${input.action}/${input.resource}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  private sanitize(value: Record<string, unknown>): Record<string, unknown> {
    const forbidden = /password|token|secret|authorization|hash/i;
    return Object.fromEntries(Object.entries(value).filter(([key]) => !forbidden.test(key)));
  }
}
