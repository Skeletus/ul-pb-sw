import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { FinalOptimizationService } from './services/final-optimization.service';
import { AuditModule } from '../audit/audit.module';
import { FinalReportsController } from './controllers/final-reports.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, AuditModule],
  providers: [ReportsService, FinalOptimizationService],
  controllers: [ReportsController, FinalReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
