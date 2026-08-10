export const BOOKING_HOLD_MINUTES = 20;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getUtcDateRange(
  date: string,
): { start: Date; end: Date } | null {
  if (!ISO_DATE_PATTERN.test(date)) return null;

  const start = new Date(`${date}T00:00:00.000Z`);
  if (
    Number.isNaN(start.getTime()) ||
    start.toISOString().slice(0, 10) !== date
  ) {
    return null;
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

export function getBookingHoldCutoff(now = new Date()): Date {
  return new Date(now.getTime() - BOOKING_HOLD_MINUTES * 60_000);
}
