import { MaintenanceService } from './maintenance.service';
describe('MaintenanceService', () => {
  const audit = { record: jest.fn().mockResolvedValue(undefined) };
  it('rejects a next date before the maintenance date', async () => {
    const service = new MaintenanceService({ machine: { findUnique: jest.fn().mockResolvedValue({ id: 1, siteId: 2 }) } } as never, audit as never);
    await expect(service.create(1, 2, { maintenanceDate: '2026-07-10', nextMaintenanceDate: '2026-07-01', type: 'PREVENTIVE', description: 'Oil', status: 'COMPLETED', cost: 10 })).rejects.toThrow('after maintenance date');
  });
  it('creates and audits a maintenance record', async () => {
    const tx = { maintenanceRecord: { create: jest.fn().mockResolvedValue({ id: 4 }) }, machine: { update: jest.fn() } };
    const prisma = { machine: { findUnique: jest.fn().mockResolvedValue({ id: 1, siteId: 3 }) }, $transaction: jest.fn((fn: (value: typeof tx) => unknown) => fn(tx)) };
    const service = new MaintenanceService(prisma as never, audit as never);
    await service.create(1, 2, { maintenanceDate: '2026-07-10', type: 'PREVENTIVE', description: 'Oil', status: 'COMPLETED', cost: 10 });
    expect(tx.maintenanceRecord.create).toHaveBeenCalled(); expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ resourceId: 4 }));
  });
});
