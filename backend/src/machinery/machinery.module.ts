import { Module } from '@nestjs/common';
import { MachineryController } from './controllers/machinery.controller';
import { SitesController } from './controllers/sites.controller';
import { MachineryService } from './services/machinery.service';

@Module({
  controllers: [MachineryController, SitesController],
  providers: [MachineryService],
  exports: [MachineryService],
})
export class MachineryModule {}
