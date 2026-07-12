import { IncidentsService } from './incidents.service';

describe('IncidentsService', () => {
  it('persists the alert, machine, site, and registering user relationship', async () => {
    const prisma = { alert: { findUnique: jest.fn().mockResolvedValue({ machineId: 2, machine: { siteId: 3 } }) }, operationalIncident: { create: jest.fn().mockResolvedValue({ id: 4 }) } };
    await new IncidentsService(prisma as never, { record: jest.fn().mockResolvedValue(undefined) } as never).create(1, 5, { title: 'Idle', description: 'Waiting for material', severity: 'HIGH' as never });
    expect(prisma.operationalIncident.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ alertId: 1, machineId: 2, siteId: 3, registeredById: 5 }) }));
  });

  it('lists incidents associated with an alert', async () => {
    const prisma = { operationalIncident: { findMany: jest.fn().mockResolvedValue([{ id: 1 }]) } };
    expect(await new IncidentsService(prisma as never, { record: jest.fn() } as never).findByAlert(7)).toEqual([{ id: 1 }]);
  });
});
