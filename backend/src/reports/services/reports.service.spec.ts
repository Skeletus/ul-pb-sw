import { MachineStatus } from '@prisma/client';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  const service = new ReportsService({} as never);
  const startDate = new Date('2026-07-08T00:00:00.000Z');
  const endDate = new Date('2026-07-08T23:59:59.999Z');

  it('calculates active hours', () => {
    const usage = service.calculateUsageHours(
      [
        {
          status: MachineStatus.ACTIVE,
          startDate: new Date('2026-07-08T08:00:00.000Z'),
          endDate: new Date('2026-07-08T10:00:00.000Z'),
        },
      ],
      startDate,
      endDate,
    );

    expect(usage.activeHours).toBe(2);
  });

  it('calculates inactive hours', () => {
    const usage = service.calculateUsageHours(
      [
        {
          status: MachineStatus.INACTIVE,
          startDate: new Date('2026-07-08T10:00:00.000Z'),
          endDate: new Date('2026-07-08T11:30:00.000Z'),
        },
      ],
      startDate,
      endDate,
    );

    expect(usage.inactiveHours).toBe(1.5);
  });

  it('calculates inactivity cost', () => {
    expect(service.calculateInactivityCost(1.5, 120)).toBe(180);
  });
});
