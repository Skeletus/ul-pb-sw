import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { IncidentPriorityService } from './incident-priority.service';
import { ReportsModule } from '../reports/reports.module';
@Module({ imports: [PrismaModule, AuditModule, RealtimeModule, ReportsModule], controllers: [AnalyticsController], providers: [AnalyticsService, IncidentPriorityService] })
export class AnalyticsModule {}
