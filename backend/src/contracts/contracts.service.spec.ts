import { ContractsService } from './contracts.service';

describe('ContractsService', () => {
  it('rejects an incoherent date range', async () => {
    const prisma = { machine: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) }, rentalContract: { findFirst: jest.fn().mockResolvedValue(null) } };
    const service = new ContractsService(prisma as never);
    await expect(service.create(1, { startDate: '2026-07-10', endDate: '2026-07-09', totalCost: 100, hourlyRate: 10 })).rejects.toThrow('Contract end date');
  });

  it('creates a contract and keeps the machine hourly rate compatible', async () => {
    const transaction = { rentalContract: { create: jest.fn().mockResolvedValue({ id: 1 }) }, machine: { update: jest.fn() } };
    const prisma = { machine: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) }, rentalContract: { findFirst: jest.fn().mockResolvedValue(null) }, $transaction: jest.fn((callback) => callback(transaction)) };
    const service = new ContractsService(prisma as never);
    await service.create(1, { startDate: '2026-07-01', endDate: '2026-07-10', totalCost: 1000, hourlyRate: 20 });
    expect(transaction.rentalContract.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ durationDays: 10 }) }));
    expect(transaction.machine.update).toHaveBeenCalledWith(expect.objectContaining({ data: { hourlyRate: 20 } }));
  });
});
