import { AlertsService } from './alerts.service';

describe('AlertsService', () => {
  it('generates an alert when inactivity exceeds 30 minutes', async () => {
    const prisma = {
      alert: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 1, machineId: 1, priority: 'HIGH', status: 'ACTIVE' }),
      },
    };
    const service = new AlertsService(prisma as never);

    const result = await service.evaluateInactivity(
      1,
      new Date('2026-07-08T10:00:00.000Z'),
      new Date('2026-07-08T10:31:00.000Z'),
    );

    expect(result).toEqual({ id: 1, machineId: 1, priority: 'HIGH', status: 'ACTIVE' });
    expect(prisma.alert.create).toHaveBeenCalledTimes(1);
  });

  it('does not generate a duplicated active alert for the same machine', async () => {
    const existingAlert = { id: 1, machineId: 1, priority: 'HIGH', status: 'ACTIVE' };
    const prisma = {
      alert: {
        findFirst: jest.fn().mockResolvedValue(existingAlert),
        create: jest.fn(),
      },
    };
    const service = new AlertsService(prisma as never);

    const result = await service.evaluateInactivity(
      1,
      new Date('2026-07-08T10:00:00.000Z'),
      new Date('2026-07-08T10:45:00.000Z'),
    );

    expect(result).toBe(existingAlert);
    expect(prisma.alert.create).not.toHaveBeenCalled();
  });
});
