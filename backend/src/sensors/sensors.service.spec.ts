import { SensorStatus } from '@prisma/client';
import { SensorsService } from './sensors.service';

describe('SensorsService', () => {
  it('rejects a machine that already has an active sensor', async () => {
    const prisma = { machine: { findUnique: jest.fn().mockResolvedValue({ sensors: [{ status: SensorStatus.ACTIVE }] }) } };
    await expect(new SensorsService(prisma as never).associate(1, 'S-1')).rejects.toThrow('already has an active sensor');
  });

  it('rejects a sensor already associated to another machine', async () => {
    const prisma = { machine: { findUnique: jest.fn().mockResolvedValue({ sensors: [] }) }, sensor: { findUnique: jest.fn().mockResolvedValue({ id: 2, machineId: 3, status: SensorStatus.ACTIVE }) } };
    await expect(new SensorsService(prisma as never).associate(1, 'S-1')).rejects.toThrow('not available');
  });

  it('associates an available sensor and validates its connection', async () => {
    const prisma = { machine: { findUnique: jest.fn().mockResolvedValue({ sensors: [] }) }, sensor: { findUnique: jest.fn().mockResolvedValue({ id: 2, machineId: null, status: SensorStatus.AVAILABLE }), update: jest.fn().mockResolvedValue({ id: 2, status: SensorStatus.ACTIVE }) } };
    const result = await new SensorsService(prisma as never).associate(1, 'S-1');
    expect(result.status).toBe(SensorStatus.ACTIVE);
    expect(prisma.sensor.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ machineId: 1, status: SensorStatus.ACTIVE }) }));
  });
});
