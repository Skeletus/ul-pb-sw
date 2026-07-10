import { AlertStatus, MachineStatus } from '@prisma/client';

export const REALTIME_EVENTS = {
  machineStatusChanged: 'machine.status.changed',
  alertCreated: 'alert.created',
  alertResolved: 'alert.resolved',
} as const;

export type MachineStatusChangedEvent = {
  machineId: number;
  machineCode: string;
  siteId: number;
  status: MachineStatus;
  effectiveAt: string;
  stateRecordId: number;
};

export type AlertRealtimeEvent = {
  alertId: number;
  machineId: number;
  machineCode: string;
  siteId: number;
  siteName: string;
  priority: string;
  status: AlertStatus;
  generationDate: string;
  resolvedDate: string | null;
  inactiveSince: string;
  inactiveDurationMinutes: number;
};
