import { AlertStatus } from '@prisma/client';
import { AlertsService } from './alerts.service';

describe('AlertsService', () => {
  const baseAlert = {
    id: 1,
    machineId: 1,
    stateRecordId: 9,
    priority: 'HIGH',
    status: AlertStatus.ACTIVE,
    generationDate: new Date('2026-07-08T10:31:00Z'),
    resolvedDate: null,
    machine: {
      id: 1,
      siteId: 1,
      code: 'MACH-001',
      type: 'Excavator',
      currentStatus: 'INACTIVE',
      hourlyRate: 120,
      site: { id: 1, name: 'Main Site', location: 'Lima' },
    },
    stateRecord: {
      id: 9,
      machineId: 1,
      status: 'INACTIVE',
      startDate: new Date('2026-07-08T10:00:00Z'),
      endDate: null,
    },
  };

  function setup(overrides: Record<string, jest.Mock> = {}) {
    const prisma = {
      alert: {
        findFirst: overrides.findFirst ?? jest.fn().mockResolvedValue(null),
        findUnique: overrides.findUnique ?? jest.fn().mockResolvedValue(baseAlert),
        create: overrides.create ?? jest.fn().mockResolvedValue(baseAlert),
        findMany: overrides.findMany ?? jest.fn().mockResolvedValue([]),
        updateMany: overrides.updateMany ?? jest.fn(),
      },
      machineStateRecord: {
        findMany: overrides.findPeriods ?? jest.fn().mockResolvedValue([]),
      },
    };
    const realtime = {
      emitAlertCreated: jest.fn(),
      emitAlertResolved: jest.fn(),
    };
    return {
      prisma,
      realtime,
      service: new AlertsService(prisma as never, realtime as never),
    };
  }

  it('does not generate an alert before thirty minutes', async () => {
    const { service, prisma } = setup();
    const result = await service.evaluateInactivity(
      1,
      9,
      new Date('2026-07-08T10:00:00Z'),
      new Date('2026-07-08T10:29:59Z'),
    );
    expect(result).toEqual({ alert: null, created: false });
    expect(prisma.alert.create).not.toHaveBeenCalled();
  });

  it('generates one active high-priority alert after thirty minutes', async () => {
    const { service, prisma } = setup();
    const result = await service.evaluateInactivity(
      1,
      9,
      new Date('2026-07-08T10:00:00Z'),
      new Date('2026-07-08T10:31:00Z'),
    );
    expect(result).toEqual({ alert: baseAlert, created: true });
    expect(prisma.alert.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ priority: 'HIGH', status: AlertStatus.ACTIVE, stateRecordId: 9 }),
      }),
    );
  });

  it('does not duplicate an alert for the same continuous inactivity period', async () => {
    const { service, prisma } = setup({ findFirst: jest.fn().mockResolvedValue(baseAlert) });
    const result = await service.evaluateInactivity(
      1,
      9,
      new Date('2026-07-08T10:00:00Z'),
      new Date('2026-07-08T10:45:00Z'),
    );
    expect(result).toEqual({ alert: baseAlert, created: false });
    expect(prisma.alert.create).not.toHaveBeenCalled();
  });

  it('resolves active alerts and records the resolution date', async () => {
    const resolvedAt = new Date('2026-07-08T10:50:00Z');
    const { service, prisma } = setup({ findMany: jest.fn().mockResolvedValue([baseAlert]) });
    const resolved = await service.resolveActiveForMachine(1, resolvedAt);
    expect(resolved[0]).toEqual(expect.objectContaining({ status: AlertStatus.RESOLVED, resolvedDate: resolvedAt }));
    expect(prisma.alert.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: AlertStatus.RESOLVED, resolvedDate: resolvedAt } }),
    );
  });

  it('publishes creation and resolution events with machine and site context', () => {
    const { service, realtime } = setup();
    service.publishCreated(baseAlert as never, baseAlert.generationDate);
    service.publishResolved({
      ...baseAlert,
      status: AlertStatus.RESOLVED,
      resolvedDate: new Date('2026-07-08T10:50:00Z'),
    } as never);
    expect(realtime.emitAlertCreated).toHaveBeenCalledWith(
      expect.objectContaining({ alertId: 1, machineCode: 'MACH-001', siteName: 'Main Site', priority: 'HIGH' }),
    );
    expect(realtime.emitAlertResolved).toHaveBeenCalledWith(
      expect.objectContaining({ alertId: 1, status: AlertStatus.RESOLVED, resolvedDate: '2026-07-08T10:50:00.000Z' }),
    );
  });
});
