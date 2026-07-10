import { AuthService } from './auth.service';

describe('AuthService password recovery and logout', () => {
  function setup(user: object | null = { id: 1, email: 'user@example.com', status: 'ACTIVE' }) {
    const transaction = { passwordResetToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) }, user: { update: jest.fn() }, session: { updateMany: jest.fn() } };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(user) },
      passwordResetToken: { updateMany: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
      session: { update: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn((argument) => typeof argument === 'function' ? argument(transaction) : Promise.all(argument)),
    };
    const mail = { sendPasswordReset: jest.fn().mockResolvedValue(undefined) };
    const config = { get: jest.fn().mockReturnValue(30) };
    return { prisma, transaction, mail, service: new AuthService(prisma as never, {} as never, config as never, mail as never) };
  }

  it('creates a hashed single-use token and sends a reset link for a registered email', async () => {
    const { service, prisma, mail } = setup();
    await service.requestPasswordReset('user@example.com');
    expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({ data: expect.objectContaining({ tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/) }) });
    expect(mail.sendPasswordReset).toHaveBeenCalledWith('user@example.com', expect.any(String));
  });

  it('returns the same response for an unknown email without sending mail', async () => {
    const { service, mail } = setup(null);
    await expect(service.requestPasswordReset('missing@example.com')).resolves.toEqual({ message: expect.any(String) });
    expect(mail.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('rejects an expired or previously consumed token', async () => {
    const { service, prisma } = setup();
    prisma.passwordResetToken.findFirst.mockResolvedValue(null);
    await expect(service.validatePasswordResetToken('expired')).rejects.toThrow('invalid, expired, or already used');
  });

  it('changes the password, consumes the token, and invalidates active sessions', async () => {
    const { service, prisma, transaction } = setup();
    prisma.passwordResetToken.findFirst.mockResolvedValue({ id: 2, userId: 1, expiresAt: new Date(Date.now() + 60000) });
    await service.resetPassword('valid-token', 'NewPassword123');
    expect(transaction.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { passwordHash: expect.any(String) } }));
    expect(transaction.session.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 1, expirationDate: null } }));
  });

  it('expires the current session on logout', async () => {
    const { service, prisma } = setup();
    await service.logout(9);
    expect(prisma.session.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 9 }, data: { expirationDate: expect.any(Date) } }));
  });
});
