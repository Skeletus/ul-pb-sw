import { Prisma, SensorStatus } from '@prisma/client';
import { TelemetryService } from './telemetry.service';

describe('TelemetryService energy consumption', () => {
  function service(readings: number[]) {
    const prisma = { machine: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) }, sensor: { findFirst: jest.fn().mockResolvedValue({ id: 2, status: SensorStatus.ACTIVE }) }, sensorReading: { findMany: jest.fn().mockResolvedValue(readings.map((value) => ({ energyConsumption: new Prisma.Decimal(value) }))) } };
    return { prisma, service: new TelemetryService(prisma as never, {} as never, { get: jest.fn().mockReturnValue('America/Lima') } as never) };
  }

  it('calculates accumulated, average, minimum, maximum, and reading count', async () => {
    const result = await service([2, 4, 6]).service.getEnergyConsumption(1, { from: '2026-07-01T00:00:00Z', to: '2026-07-02T00:00:00Z' });
    expect(result).toEqual(expect.objectContaining({ totalConsumption: 12, averageConsumption: 4, minimumConsumption: 2, maximumConsumption: 6, readingCount: 3 }));
  });

  it('returns an empty aggregate for a machine without readings', async () => {
    expect(await service([]).service.getEnergyConsumption(1, { from: '2026-07-01T00:00:00Z', to: '2026-07-02T00:00:00Z' })).toEqual(expect.objectContaining({ totalConsumption: 0, averageConsumption: null, readingCount: 0 }));
  });

  it('rejects an invalid date range', async () => {
    await expect(service([]).service.getEnergyConsumption(1, { from: '2026-07-02T00:00:00Z', to: '2026-07-01T00:00:00Z' })).rejects.toThrow('range end');
  });
});
