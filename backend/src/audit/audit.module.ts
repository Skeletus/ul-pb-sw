import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditController } from './audit.controller';
import { AuditLogService } from './audit-log.service';

@Module({ imports: [PrismaModule], controllers: [AuditController], providers: [AuditLogService], exports: [AuditLogService] })
export class AuditModule {}
