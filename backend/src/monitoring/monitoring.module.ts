import { Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module';
import { MonitoringService } from './services/monitoring.service';
import { UsageClassifier } from './services/usage-classifier.service';

@Module({
  imports: [AlertsModule],
  providers: [MonitoringService, UsageClassifier],
  exports: [MonitoringService, UsageClassifier],
})
export class MonitoringModule {}
