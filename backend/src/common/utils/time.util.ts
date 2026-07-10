export function minutesBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / 60000);
}

export function overlapInHours(
  start: Date,
  end: Date | null,
  windowStart: Date,
  windowEnd: Date,
): number {
  const effectiveStart = new Date(Math.max(start.getTime(), windowStart.getTime()));
  const effectiveEnd = new Date(Math.min((end || windowEnd).getTime(), windowEnd.getTime()));

  if (effectiveEnd <= effectiveStart) {
    return 0;
  }

  return (effectiveEnd.getTime() - effectiveStart.getTime()) / 3600000;
}

export type WorkdayConfiguration = {
  startTime: string;
  endTime: string;
  timeZone: string;
};

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function parseTime(value: string): { hour: number; minute: number } {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid workday time "${value}". Expected HH:mm.`);
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    throw new Error(`Invalid workday time "${value}". Expected HH:mm.`);
  }

  return { hour, minute };
}

function partsInTimeZone(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const values = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function zonedDateTimeToUtc(parts: DateParts, timeZone: string): Date {
  const targetTimestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  let result = new Date(targetTimestamp);

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const actual = partsInTimeZone(result, timeZone);
    const actualTimestamp = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second,
    );
    const difference = targetTimestamp - actualTimestamp;
    if (difference === 0) {
      break;
    }
    result = new Date(result.getTime() + difference);
  }

  return result;
}

function addCalendarDays(parts: DateParts, days: number): DateParts {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    ...parts,
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function getWorkdayRange(date: string, configuration: WorkdayConfiguration) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!dateMatch) {
    throw new Error(`Invalid report date "${date}". Expected YYYY-MM-DD.`);
  }

  const startTime = parseTime(configuration.startTime);
  const endTime = parseTime(configuration.endTime);
  const baseParts: DateParts = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: startTime.hour,
    minute: startTime.minute,
    second: 0,
  };
  const crossesMidnight =
    endTime.hour < startTime.hour ||
    (endTime.hour === startTime.hour && endTime.minute <= startTime.minute);
  const endParts = addCalendarDays(
    { ...baseParts, hour: endTime.hour, minute: endTime.minute },
    crossesMidnight ? 1 : 0,
  );

  return {
    startDate: zonedDateTimeToUtc(baseParts, configuration.timeZone),
    endDate: zonedDateTimeToUtc(endParts, configuration.timeZone),
  };
}

export function getLocalDateTime(date: Date, timeZone: string) {
  const parts = partsInTimeZone(date, timeZone);
  return {
    date: `${parts.year.toString().padStart(4, '0')}-${parts.month
      .toString()
      .padStart(2, '0')}-${parts.day.toString().padStart(2, '0')}`,
    time: `${parts.hour.toString().padStart(2, '0')}:${parts.minute
      .toString()
      .padStart(2, '0')}`,
  };
}

export function previousCalendarDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const previous = new Date(Date.UTC(year, month - 1, day - 1));
  return `${previous.getUTCFullYear().toString().padStart(4, '0')}-${(
    previous.getUTCMonth() + 1
  )
    .toString()
    .padStart(2, '0')}-${previous.getUTCDate().toString().padStart(2, '0')}`;
}
