import { Module } from '@nestjs/common';
import { MachineryController } from './controllers/machinery.controller';
import { MachineryService } from './services/machinery.service';

@Module({
  controllers: [MachineryController],
  providers: [MachineryService],
  exports: [MachineryService],
})
export class MachineryModule {}
