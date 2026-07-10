import { MachineStatus, Prisma } from '@prisma/client';
import { MonitoringService } from './monitoring.service';

describe('MonitoringService', () => {
  const reading = {
    id: 2,
    machineId: 1,
    sensorId: null,
    timestamp: new Date('2026-07-08T10:06:00Z'),
    vibration: new Prisma.Decimal(0.1),
    energyConsumption: new Prisma.Decimal(2),
  };

  function createService(openStatus: MachineStatus) {
    const openState = {
      id: 7,
      machineId: 1,
      status: openStatus,
      startDate: new Date('2026-07-08T09:00:00Z'),
      endDate: null,
    };
    const createdState = {
      ...openState,
      id: 8,
      status: MachineStatus.INACTIVE,
      startDate: new Date('2026-07-08T10:05:00Z'),
    };
    const transaction = {
      machineStateRecord: {
        findFirst: jest.fn().mockResolvedValue(openState),
        update: jest.fn().mockResolvedValue({ ...openState, endDate: createdState.startDate }),
        create: jest.fn().mockResolvedValue(createdState),
      },
      machine: {
        update: jest.fn(),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 1,
          siteId: 1,
          code: 'MACH-001',
          currentStatus: MachineStatus.INACTIVE,
          site: { id: 1, name: 'Site', location: null },
          machineStateRecords: [createdState],
        }),
      },
    };
    const prisma = {
      machine: { findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 1, currentStatus: openStatus }) },
      sensorReading: {
        findMany: jest.fn().mockResolvedValue([
          reading,
          { ...reading, id: 1, timestamp: new Date('2026-07-08T10:00:00Z') },
        ]),
      },
      $transaction: jest.fn((callback) => callback(transaction)),
    };
    const classifier = {
      classify: jest.fn().mockReturnValue({
        status: MachineStatus.INACTIVE,
        inactiveSince: new Date('2026-07-08T10:00:00Z'),
        transitionAt: openStatus === MachineStatus.INACTIVE ? null : createdState.startDate,
      }),
    };
    const alerts = {
      resolveActiveForMachine: jest.fn().mockResolvedValue([]),
      evaluateInactivity: jest.fn().mockResolvedValue({ alert: null, created: false }),
      publishResolved: jest.fn(),
      publishCreated: jest.fn(),
    };
    const realtime = { emitMachineStatusChanged: jest.fn() };
    return {
      service: new MonitoringService(prisma as never, classifier as never, alerts as never, realtime as never),
      transaction,
      realtime,
    };
  }

  it('does not duplicate an open period when the classified state is unchanged', async () => {
    const { service, transaction, realtime } = createService(MachineStatus.INACTIVE);
    await service.processReading(1, reading);
    expect(transaction.machineStateRecord.create).not.toHaveBeenCalled();
    expect(realtime.emitMachineStatusChanged).not.toHaveBeenCalled();
  });

  it('persists and publishes a machine status transition once', async () => {
    const { service, transaction, realtime } = createService(MachineStatus.ACTIVE);
    await service.processReading(1, reading);
    expect(transaction.machineStateRecord.create).toHaveBeenCalledTimes(1);
    expect(realtime.emitMachineStatusChanged).toHaveBeenCalledWith(
      expect.objectContaining({ machineId: 1, status: MachineStatus.INACTIVE, stateRecordId: 8 }),
    );
  });
});
