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
