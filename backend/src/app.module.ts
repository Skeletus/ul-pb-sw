import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { MachineryModule } from './machinery/machinery.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RealtimeModule } from './realtime/realtime.module';
import { ContractsModule } from './contracts/contracts.module';
import { SensorsModule } from './sensors/sensors.module';
import { IncidentsModule } from './incidents/incidents.module';
import { RolesModule } from './roles/roles.module';
import { AuditModule } from './audit/audit.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    MachineryModule,
    AlertsModule,
    MonitoringModule,
    TelemetryModule,
    ReportsModule,
    RealtimeModule,
    ContractsModule,
    SensorsModule,
    IncidentsModule,
    RolesModule,
    AuditModule,
    MaintenanceModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
