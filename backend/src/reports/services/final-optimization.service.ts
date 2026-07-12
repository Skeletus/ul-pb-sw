import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, MachineStatus } from '@prisma/client';
// pdfkit exposes a CommonJS constructor and has no runtime default export.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import PDFDocument = require('pdfkit');
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { FinalReportDto } from '../dto/final-report.dto';

@Injectable()
export class FinalOptimizationService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService) {}

  private parse(q: FinalReportDto) {
    const from = new Date(q.from);
    const to = new Date(q.to);
    if (!(from < to)) throw new BadRequestException('Report date range is invalid');
    const machineIds = q.machineIds?.split(',').map(Number).filter(Number.isInteger);
    return { from, to, siteId: q.siteId ? Number(q.siteId) : undefined, machineIds };
  }

  private async usage(machineId: number, from: Date, to: Date) {
    const records = await this.prisma.machineStateRecord.findMany({ where: { machineId, startDate: { lt: to }, OR: [{ endDate: null }, { endDate: { gt: from } }] } });
    let active = 0; let inactive = 0;
    for (const record of records) {
      const start = Math.max(record.startDate.getTime(), from.getTime());
      const end = Math.min((record.endDate ?? to).getTime(), to.getTime());
      const hours = Math.max(0, (end - start) / 3600000);
      if (record.status === MachineStatus.ACTIVE) active += hours;
      if (record.status === MachineStatus.INACTIVE) inactive += hours;
    }
    return { active, inactive };
  }

  async generate(userId: number, q: FinalReportDto) {
    const parsed = this.parse(q);
    const machines = await this.prisma.machine.findMany({ where: { id: parsed.machineIds ? { in: parsed.machineIds } : undefined, siteId: parsed.siteId }, include: { site: true } });
    if (!machines.length) throw new BadRequestException('No machines match the selected filters');
    const metrics = await Promise.all(machines.map(async machine => {
      const usage = await this.usage(machine.id, parsed.from, parsed.to);
      const [incidents, resolvedIncidents, alerts, maintenance] = await Promise.all([
        this.prisma.operationalIncident.count({ where: { machineId: machine.id, registrationDate: { gte: parsed.from, lt: parsed.to } } }),
        this.prisma.operationalIncident.count({ where: { machineId: machine.id, status: 'RESOLVED', registrationDate: { gte: parsed.from, lt: parsed.to } } }),
        this.prisma.alert.count({ where: { machineId: machine.id, generationDate: { gte: parsed.from, lt: parsed.to } } }),
        this.prisma.maintenanceRecord.aggregate({ where: { machineId: machine.id, maintenanceDate: { gte: parsed.from, lt: parsed.to } }, _sum: { cost: true }, _count: { id: true } }),
      ]);
      const inactivityCost = usage.inactive * Number(machine.hourlyRate);
      const usagePercentage = usage.active + usage.inactive ? usage.active / (usage.active + usage.inactive) * 100 : null;
      const recommendation = usagePercentage === null
        ? { action: 'REVIEW_MACHINE', justification: 'No classified usage data exists for the selected period.' }
        : usagePercentage < 30
          ? { action: 'WITHDRAW_MACHINE', justification: `Effective usage is ${usagePercentage.toFixed(2)}%, below 30%.` }
          : usagePercentage < 60
            ? { action: 'REDUCE_RENTAL', justification: `Effective usage is ${usagePercentage.toFixed(2)}%, below 60%.` }
            : { action: 'KEEP_MACHINE', justification: `Effective usage is ${usagePercentage.toFixed(2)}%, supporting continued operation.` };
      return { machineId: machine.id, code: machine.code, siteName: machine.site.name, activeHours: Number(usage.active.toFixed(2)), inactiveHours: Number(usage.inactive.toFixed(2)), effectiveUsagePercentage: usagePercentage === null ? null : Number(usagePercentage.toFixed(2)), inactivityCost: Number(inactivityCost.toFixed(2)), projectedSavings: Number((inactivityCost * 0.2).toFixed(2)), alerts, incidents, resolvedIncidents, maintenanceCount: maintenance._count.id, maintenanceCost: Number(maintenance._sum.cost ?? 0), recommendation };
    }));
    const summary = {
      activeHours: metrics.reduce((sum, item) => sum + item.activeHours, 0),
      inactiveHours: metrics.reduce((sum, item) => sum + item.inactiveHours, 0),
      inactivityCost: metrics.reduce((sum, item) => sum + item.inactivityCost, 0),
      projectedSavings: metrics.reduce((sum, item) => sum + item.projectedSavings, 0),
      alerts: metrics.reduce((sum, item) => sum + item.alerts, 0),
      incidents: metrics.reduce((sum, item) => sum + item.incidents, 0),
      resolvedIncidents: metrics.reduce((sum, item) => sum + item.resolvedIncidents, 0),
      maintenanceCost: metrics.reduce((sum, item) => sum + item.maintenanceCost, 0),
    };
    const unique = { siteId: parsed.siteId ?? null, startDate: parsed.from, endDate: parsed.to, generatedById: userId };
    const data = { machineIds: parsed.machineIds ?? machines.map(machine => machine.id), summary, machineMetrics: metrics, recommendations: metrics.map(item => item.recommendation), incidentMetrics: { total: summary.incidents, resolved: summary.resolvedIncidents }, maintenanceMetrics: { cost: summary.maintenanceCost } };
    const existing = await this.prisma.finalOptimizationReport.findFirst({ where: unique });
    const report = existing
      ? await this.prisma.finalOptimizationReport.update({ where: { id: existing.id }, data })
      : await this.prisma.finalOptimizationReport.create({ data: { ...unique, ...data } });
    await this.audit.record({ userId, action: AuditAction.REPORT_GENERATED, resource: 'FinalOptimizationReport', resourceId: report.id, metadata: { siteId: parsed.siteId, from: q.from, to: q.to } });
    return report;
  }

  list() { return this.prisma.finalOptimizationReport.findMany({ orderBy: { generatedAt: 'desc' }, take: 50 }); }
  async one(id: number) { const report = await this.prisma.finalOptimizationReport.findUnique({ where: { id } }); if (!report) throw new NotFoundException('Final optimization report not found'); return report; }

  async export(id: number, userId: number) {
    const report = await this.one(id);
    const document = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];
    document.on('data', (chunk: Buffer) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve, reject) => { document.on('end', () => resolve(Buffer.concat(chunks))); document.on('error', reject); });
    document.fontSize(20).text('WorkMeter - Final Cost Optimization Report').moveDown();
    document.fontSize(11).text(`Period: ${report.startDate.toISOString()} to ${report.endDate.toISOString()}`).text(`Generated: ${report.generatedAt.toISOString()}`).moveDown();
    document.fontSize(14).text('Executive summary').fontSize(10).text(JSON.stringify(report.summary, null, 2)).moveDown();
    document.fontSize(14).text('Machines and recommendations').fontSize(9).text(JSON.stringify(report.machineMetrics, null, 2));
    document.end();
    const pdf = await done;
    await this.audit.record({ userId, action: AuditAction.REPORT_EXPORTED, resource: 'FinalOptimizationReport', resourceId: id });
    return pdf;
  }
}
