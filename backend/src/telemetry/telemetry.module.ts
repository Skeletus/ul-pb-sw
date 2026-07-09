import { Module } from '@nestjs/common';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { TelemetryController } from './controllers/telemetry.controller';
import { TelemetryService } from './services/telemetry.service';

@Module({
  imports: [MonitoringModule],
  controllers: [TelemetryController],
  providers: [TelemetryService],
})
export class TelemetryModule {}
