import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MachineStatus } from '@prisma/client';
import { minutesBetween } from '../../common/utils/time.util';

export type ClassifierReading = {
  timestamp: Date;
  vibration: number;
  energyConsumption: number;
};

export type ClassificationResult = {
  status: MachineStatus;
  inactiveSince: Date | null;
};

@Injectable()
export class UsageClassifier {
  readonly vibrationThreshold: number;
  readonly consumptionThreshold: number;
  readonly inactivityMinutes: number;

  constructor(configService?: ConfigService) {
    this.vibrationThreshold = Number(configService?.get('VIBRATION_THRESHOLD') ?? 0.5);
    this.consumptionThreshold = Number(configService?.get('ENERGY_THRESHOLD') ?? 5);
    this.inactivityMinutes = Number(configService?.get('INACTIVITY_THRESHOLD_MINUTES') ?? 5);
  }

  isOperational(reading: ClassifierReading): boolean {
    return (
      reading.vibration >= this.vibrationThreshold &&
      reading.energyConsumption >= this.consumptionThreshold
    );
  }

  classify(readings: ClassifierReading[], currentStatus: MachineStatus): ClassificationResult {
    if (readings.length === 0) {
      return { status: currentStatus, inactiveSince: null };
    }

    const ordered = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const latest = ordered[ordered.length - 1];

    if (this.isOperational(latest)) {
      return { status: MachineStatus.ACTIVE, inactiveSince: null };
    }

    const lastOperationalIndex = ordered.map((reading) => this.isOperational(reading)).lastIndexOf(true);
    const belowThresholdReadings = ordered.slice(lastOperationalIndex + 1);
    const inactiveSince = belowThresholdReadings[0]?.timestamp ?? latest.timestamp;
    const inactiveMinutes = minutesBetween(inactiveSince, latest.timestamp);

    if (inactiveMinutes > this.inactivityMinutes) {
      return { status: MachineStatus.INACTIVE, inactiveSince };
    }

    return { status: currentStatus, inactiveSince };
  }
}
