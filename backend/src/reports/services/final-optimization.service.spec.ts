import { FinalOptimizationService } from './final-optimization.service';
describe('FinalOptimizationService', () => {
  it('rejects an invalid period before accessing persistence', async () => {
    const service = new FinalOptimizationService({} as never, {} as never);
    await expect(service.generate(1, { from: '2026-07-10', to: '2026-07-01' })).rejects.toThrow('date range is invalid');
  });
  it('returns a not found error for an unknown report', async () => {
    const service = new FinalOptimizationService({ finalOptimizationReport: { findUnique: jest.fn().mockResolvedValue(null) } } as never, {} as never);
    await expect(service.one(99)).rejects.toThrow('not found');
  });
});
