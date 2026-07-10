import { MachineStatus, Prisma } from '@prisma/client';
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

  it('calculates a day containing active and inactive hours and usage percentage', () => {
    const usage = service.calculateUsageHours(
      [
        { status: MachineStatus.ACTIVE, startDate: new Date('2026-07-08T08:00:00Z'), endDate: new Date('2026-07-08T10:00:00Z') },
        { status: MachineStatus.INACTIVE, startDate: new Date('2026-07-08T10:00:00Z'), endDate: new Date('2026-07-08T11:00:00Z') },
        { status: MachineStatus.UNDER_DOCUMENTED_MAINTENANCE, startDate: new Date('2026-07-08T11:00:00Z'), endDate: new Date('2026-07-08T12:00:00Z') },
      ],
      startDate,
      endDate,
    );
    expect(usage.activeHours).toBe(2);
    expect(usage.inactiveHours).toBe(1);
    expect(usage.totalClassifiedHours).toBe(3);
    expect(usage.effectiveUsagePercentage).toBeCloseTo(66.67, 2);
  });

  it('clips intervals that cross the report boundaries', () => {
    const usage = service.calculateUsageHours(
      [{ status: MachineStatus.ACTIVE, startDate: new Date('2026-07-07T23:00:00Z'), endDate: new Date('2026-07-09T01:00:00Z') }],
      startDate,
      endDate,
    );
    expect(usage.activeHours).toBeCloseTo(24, 4);
  });

  it('clips an open state record at the report end', () => {
    const usage = service.calculateUsageHours(
      [{ status: MachineStatus.INACTIVE, startDate: new Date('2026-07-08T22:00:00Z'), endDate: null }],
      startDate,
      endDate,
    );
    expect(usage.inactiveHours).toBeCloseTo(2, 4);
  });

  it('returns a truthful no-data result without a zero-percent claim', () => {
    expect(service.calculateUsageHours([], startDate, endDate)).toEqual({
      activeHours: 0,
      inactiveHours: 0,
      totalClassifiedHours: 0,
      effectiveUsagePercentage: null,
    });
  });

  it('uses the configured work timezone and schedule', () => {
    const config = {
      get: jest.fn((key: string) => ({ WORKDAY_START: '08:00', WORKDAY_END: '17:00', WORK_TIMEZONE: 'America/Lima' })[key]),
    };
    const configuredService = new ReportsService({} as never, config as never);
    expect(configuredService.getReportRange('2026-07-08')).toEqual({
      startDate: new Date('2026-07-08T13:00:00.000Z'),
      endDate: new Date('2026-07-08T22:00:00.000Z'),
    });
  });

  it('runs automatic generation at the configured local closing time', async () => {
    const prisma = { machine: { findMany: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]) } };
    const automaticService = new ReportsService(prisma as never);
    const generate = jest.spyOn(automaticService, 'generateDailyReport')
      .mockResolvedValueOnce({ reportId: 10 } as never)
      .mockResolvedValueOnce({ reportId: 11 } as never);
    const result = await automaticService.runAutomaticGeneration(new Date('2026-07-08T22:00:00Z'));
    expect(result).toEqual([10, 11]);
    expect(generate).toHaveBeenCalledWith({ machineId: 1, date: '2026-07-08' });
  });

  it('reuses the persisted report when generation is repeated', async () => {
    const storedReport = {
      id: 20,
      siteId: 1,
      machineId: 1,
      type: 'DAILY',
      startDate: new Date('2026-07-08T13:00:00Z'),
      endDate: new Date('2026-07-08T22:00:00Z'),
      fileUrl: null,
      generatedAt: new Date('2026-07-08T22:00:00Z'),
      activeHours: new Prisma.Decimal(0),
      inactiveHours: new Prisma.Decimal(0),
      totalClassifiedHours: new Prisma.Decimal(0),
      effectiveUsagePercentage: null,
      machine: { id: 1, code: 'MACH-001', siteId: 1, hourlyRate: new Prisma.Decimal(120), site: { id: 1, name: 'Site', location: null } },
      inactivityCosts: [{ contractRate: new Prisma.Decimal(120), amount: new Prisma.Decimal(0) }],
    };
    const transaction = {
      report: {
        upsert: jest.fn().mockResolvedValue(storedReport),
        findUniqueOrThrow: jest.fn().mockResolvedValue(storedReport),
      },
      inactivityCost: { upsert: jest.fn() },
    };
    const prisma = {
      machine: { findUnique: jest.fn().mockResolvedValue(storedReport.machine) },
      machineStateRecord: { findMany: jest.fn().mockResolvedValue([]) },
      $transaction: jest.fn((callback) => callback(transaction)),
    };
    const idempotentService = new ReportsService(prisma as never);
    const first = await idempotentService.generateDailyReport({ machineId: 1, date: '2026-07-08' });
    const second = await idempotentService.generateDailyReport({ machineId: 1, date: '2026-07-08' });
    expect(first.reportId).toBe(20);
    expect(second.reportId).toBe(20);
    expect(transaction.report.upsert).toHaveBeenCalledTimes(2);
  });

  it('orders multi-machine utilization and marks values below the threshold', async () => {
    const prisma = {
      machine: { findMany: jest.fn().mockResolvedValue([
        { id: 1, code: 'LOW', type: 'A', siteId: 1, hourlyRate: new Prisma.Decimal(100), site: { name: 'Site' } },
        { id: 2, code: 'HIGH', type: 'B', siteId: 1, hourlyRate: new Prisma.Decimal(100), site: { name: 'Site' } },
      ]) },
      machineStateRecord: { findMany: jest.fn()
        .mockResolvedValueOnce([{ status: MachineStatus.ACTIVE, startDate: new Date('2026-07-08T13:00:00Z'), endDate: new Date('2026-07-08T14:00:00Z') }, { status: MachineStatus.INACTIVE, startDate: new Date('2026-07-08T14:00:00Z'), endDate: new Date('2026-07-08T17:00:00Z') }])
        .mockResolvedValueOnce([{ status: MachineStatus.ACTIVE, startDate: new Date('2026-07-08T13:00:00Z'), endDate: new Date('2026-07-08T17:00:00Z') }]) },
    };
    const result = await new ReportsService(prisma as never).getUsageComparison({ from: '2026-07-08', to: '2026-07-08', lowUtilizationThreshold: 40 });
    expect(result.machines.map((machine) => machine.machineCode)).toEqual(['LOW', 'HIGH']);
    expect(result.machines[0]).toEqual(expect.objectContaining({ lowUtilization: true, inactivityCost: 300 }));
  });

  it('generates a non-empty PDF containing real report data', async () => {
    const reportService = new ReportsService({} as never);
    jest.spyOn(reportService, 'getUsageComparison').mockResolvedValue({ from: '2026-07-08', to: '2026-07-08', timeZone: 'America/Lima', lowUtilizationThreshold: 40, machines: [{ machineId: 1, machineCode: 'MACH-001', machineType: 'Excavator', siteId: 1, siteName: 'Site', activeHours: 2, inactiveHours: 1, totalClassifiedHours: 3, effectiveUsagePercentage: 66.67, hourlyRate: 100, inactivityCost: 100, availableOperatingCost: 300, lowUtilization: false }] });
    const pdf = await reportService.generateUsagePdf(1, { from: '2026-07-08', to: '2026-07-08' });
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdf.length).toBeGreaterThan(500);
  });
});
