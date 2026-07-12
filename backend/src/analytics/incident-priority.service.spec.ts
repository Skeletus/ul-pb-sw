import { IncidentPriorityService } from './incident-priority.service';
describe('IncidentPriorityService', () => {
  it('gives critical incidents the highest reproducible severity weight', () => {
    const service = new IncidentPriorityService({} as never);
    const low = service.calculateScore({ severity: 'LOW' as never, machineStatus: 'ACTIVE' as never, registrationDate: new Date(), alertCount: 0, inactivityMinutes: 0 });
    const critical = service.calculateScore({ severity: 'CRITICAL' as never, machineStatus: 'ACTIVE' as never, registrationDate: new Date(), alertCount: 0, inactivityMinutes: 0 });
    expect(critical).toBeGreaterThan(low);
    expect(service.calculateScore({ severity: 'HIGH' as never, machineStatus: 'ACTIVE' as never, registrationDate: new Date(0), alertCount: 2, inactivityMinutes: 60 })).toBe(service.calculateScore({ severity: 'HIGH' as never, machineStatus: 'ACTIVE' as never, registrationDate: new Date(0), alertCount: 2, inactivityMinutes: 60 }));
  });
});
