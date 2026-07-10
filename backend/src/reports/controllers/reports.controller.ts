import { Controller, Get, Param, ParseIntPipe, Query, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DailyReportQueryDto } from '../dto/daily-report-query.dto';
import { ReportsService } from '../services/reports.service';
import { ListDailyReportsQueryDto } from '../dto/list-daily-reports-query.dto';
import { UsageComparisonQueryDto } from '../dto/usage-comparison-query.dto';
import { SavingsProjectionQueryDto } from '../dto/savings-projection-query.dto';

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

  @Get('usage-comparison')
  getUsageComparison(@Query() query: UsageComparisonQueryDto) {
    return this.reportsService.getUsageComparison(query);
  }

  @Get('savings-projection')
  getSavingsProjection(@Query() query: SavingsProjectionQueryDto) { return this.reportsService.getSavingsProjection(query.machineId, query.startDate, query.endDate); }

  @Get('machines/:machineId/pdf')
  async downloadPdf(
    @Param('machineId', ParseIntPipe) machineId: number,
    @Query() query: UsageComparisonQueryDto,
  ) {
    const pdf = await this.reportsService.generateUsagePdf(machineId, query);
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: `attachment; filename="workmeter-${machineId}-${query.from}-${query.to}.pdf"`,
    });
  }
}
