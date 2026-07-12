import { AuditLogService } from './audit-log.service';
describe('AuditLogService', () => {
  it('removes secrets before persisting metadata', async () => {
    const prisma = { auditLog: { create: jest.fn().mockResolvedValue({}) } };
    await new AuditLogService(prisma as never).record({ action: 'LOGIN' as never, resource: 'User', metadata: { password: 'secret', token: 'jwt', safe: 'ok' } });
    expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ metadata: { safe: 'ok' } }) }));
  });
  it('does not propagate persistence errors', async () => {
    const prisma = { auditLog: { create: jest.fn().mockRejectedValue(new Error('database down')) } };
    await expect(new AuditLogService(prisma as never).record({ action: 'CREATE' as never, resource: 'Machine' })).resolves.toBeUndefined();
  });
});
