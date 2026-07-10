import { Controller, Get, UseGuards } from '@nestjs/common'; import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; import { MachineryService } from '../services/machinery.service';
@Controller('sites') @UseGuards(JwtAuthGuard) export class SitesController { constructor(private readonly machinery:MachineryService){} @Get() findAll(){return this.machinery.sites()} }
