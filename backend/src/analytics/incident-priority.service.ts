import { Injectable } from '@nestjs/common';
import { IncidentSeverity, IncidentStatus, MachineStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
const severityWeight: Record<IncidentSeverity, number> = { LOW: 10, MEDIUM: 30, HIGH: 60, CRITICAL: 100 };
@Injectable()
export class IncidentPriorityService {
  constructor(private readonly prisma: PrismaService) {}
  calculateScore(input: { severity: IncidentSeverity; machineStatus: MachineStatus; registrationDate: Date; alertCount: number; inactivityMinutes: number }) {
    const age = Math.min(20, Math.floor((Date.now() - input.registrationDate.getTime()) / 86400000));
    const status = input.machineStatus === MachineStatus.DECOMMISSIONED ? 20 : input.machineStatus === MachineStatus.INACTIVE ? 15 : 0;
    return Number((severityWeight[input.severity] + status + Math.min(20, input.inactivityMinutes / 30) + Math.min(10, input.alertCount * 3) + age).toFixed(2));
  }
  async prioritize(filters: { severity?: IncidentSeverity; status?: IncidentStatus; machineId?: number; siteId?: number }) {
    const incidents = await this.prisma.operationalIncident.findMany({ where: filters, include: { machine: true, site: true, alert: true }, orderBy: { registrationDate: 'desc' } });
    const results = incidents.map(incident => ({ ...incident, priorityScore: this.calculateScore({ severity: incident.severity, machineStatus: incident.machine.currentStatus, registrationDate: incident.registrationDate, alertCount: 1, inactivityMinutes: incident.alert.resolvedDate ? (incident.alert.resolvedDate.getTime()-incident.registrationDate.getTime())/60000 : (Date.now()-incident.registrationDate.getTime())/60000 }) }));
    for (const item of results) if (item.priorityScore !== Number(item.priorityScore)) item.priorityScore = 0;
    await Promise.all(results.map(item => this.prisma.operationalIncident.update({ where: { id: item.id }, data: { priorityScore: item.priorityScore, priorityUpdatedAt: new Date() } })));
    return results.sort((a,b) => (b.severity === 'CRITICAL' ? 1 : 0) - (a.severity === 'CRITICAL' ? 1 : 0) || b.priorityScore - a.priorityScore || b.registrationDate.getTime() - a.registrationDate.getTime());
  }
}
