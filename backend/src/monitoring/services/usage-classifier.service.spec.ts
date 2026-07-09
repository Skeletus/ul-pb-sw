import { MachineStatus } from '@prisma/client';
import { UsageClassifier } from './usage-classifier.service';

describe('UsageClassifier', () => {
  it('classifies a machine as active when values are above thresholds', () => {
    const classifier = new UsageClassifier();
    const result = classifier.classify(
      [
        {
          timestamp: new Date('2026-07-08T10:00:00.000Z'),
          vibration: 0.8,
          energyConsumption: 10,
        },
      ],
      MachineStatus.REGISTERED,
    );

    expect(result.status).toBe(MachineStatus.ACTIVE);
    expect(result.inactiveSince).toBeNull();
  });

  it('classifies a machine as inactive after the 5 minute threshold', () => {
    const classifier = new UsageClassifier();
    const result = classifier.classify(
      [
        {
          timestamp: new Date('2026-07-08T10:00:00.000Z'),
          vibration: 0.1,
          energyConsumption: 2,
        },
        {
          timestamp: new Date('2026-07-08T10:06:00.000Z'),
          vibration: 0.1,
          energyConsumption: 2,
        },
      ],
      MachineStatus.ACTIVE,
    );

    expect(result.status).toBe(MachineStatus.INACTIVE);
    expect(result.inactiveSince).toEqual(new Date('2026-07-08T10:00:00.000Z'));
  });
});
