import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DailyReportQueryDto } from '../dto/daily-report-query.dto';
import { ReportsService } from '../services/reports.service';
import { ListDailyReportsQueryDto } from '../dto/list-daily-reports-query.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily/generated')
  @ApiOkResponse({ description: 'Persisted daily reports generated manually or automatically' })
  findGeneratedDailyReports(@Query() query: ListDailyReportsQueryDto) {
    return this.reportsService.findGeneratedDailyReports(query);
  }

  @Get('daily')
  @ApiOkResponse({ description: 'Daily report with active hours, inactive hours and inactivity cost' })
  generateDailyReport(@Query() query: DailyReportQueryDto) {
    return this.reportsService.generateDailyReport(query);
  }
}
