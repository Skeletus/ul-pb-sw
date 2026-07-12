import { Module } from '@nestjs/common';
import { MachineryController } from './controllers/machinery.controller';
import { SitesController } from './controllers/sites.controller';
import { MachineryService } from './services/machinery.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [MachineryController, SitesController],
  providers: [MachineryService],
  exports: [MachineryService],
})
export class MachineryModule {}
