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
    expect(result.transitionAt).toEqual(new Date('2026-07-08T10:05:00.000Z'));
  });

  it('does not classify a machine as inactive before five minutes', () => {
    const classifier = new UsageClassifier();
    const result = classifier.classify(
      [
        { timestamp: new Date('2026-07-08T10:00:00Z'), vibration: 0.1, energyConsumption: 2 },
        { timestamp: new Date('2026-07-08T10:04:59Z'), vibration: 0.1, energyConsumption: 2 },
      ],
      MachineStatus.ACTIVE,
    );
    expect(result.status).toBe(MachineStatus.ACTIVE);
  });

  it('restarts the inactivity period after an intermediate operational reading', () => {
    const classifier = new UsageClassifier();
    const result = classifier.classify(
      [
        { timestamp: new Date('2026-07-08T10:00:00Z'), vibration: 0.1, energyConsumption: 2 },
        { timestamp: new Date('2026-07-08T10:04:00Z'), vibration: 0.8, energyConsumption: 2 },
        { timestamp: new Date('2026-07-08T10:08:00Z'), vibration: 0.1, energyConsumption: 2 },
      ],
      MachineStatus.ACTIVE,
    );
    expect(result.status).toBe(MachineStatus.ACTIVE);
    expect(result.inactiveSince).toEqual(new Date('2026-07-08T10:08:00Z'));
  });

  it('returns an inactive machine to active when either value is operational', () => {
    const classifier = new UsageClassifier();
    const result = classifier.classify(
      [{ timestamp: new Date('2026-07-08T10:10:00Z'), vibration: 0.1, energyConsumption: 8 }],
      MachineStatus.INACTIVE,
    );
    expect(result.status).toBe(MachineStatus.ACTIVE);
    expect(result.transitionAt).toEqual(new Date('2026-07-08T10:10:00Z'));
  });
});
