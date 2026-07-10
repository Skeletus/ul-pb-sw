import { Module } from '@nestjs/common';
import { AlertsController } from './controllers/alerts.controller';
import { AlertsService } from './services/alerts.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { AlertConfigurationController } from './controllers/alert-configuration.controller';
import { AlertConfigurationService } from './services/alert-configuration.service';

@Module({
  imports: [RealtimeModule],
  controllers: [AlertsController, AlertConfigurationController],
  providers: [AlertsService, AlertConfigurationService],
  exports: [AlertsService],
})
export class AlertsModule {}
