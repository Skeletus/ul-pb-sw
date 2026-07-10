import { Module } from '@nestjs/common';
import { AlertsController } from './controllers/alerts.controller';
import { AlertsService } from './services/alerts.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
