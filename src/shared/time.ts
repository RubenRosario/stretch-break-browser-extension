import { type Settings } from '@/shared';

/**
 * Parsed HH:MM clock parts.
 */
export interface HHMMParts {
  /** Hour component in 24h format. */
  hours: number;
  /** Minute component. */
  minutes: number;
}

/**
 * Parses a local-time HH:MM string.
 *
 * @param value Time string in HH:MM format.
 * @returns Parsed hour/minute components.
 * @throws Error when format or range is invalid.
 */
export function parseHHMM(value: string): HHMMParts {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid HH:MM value: ${value}`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid HH:MM range: ${value}`);
  }

  return { hours, minutes };
}

/**
 * Creates a date on the same local day with the given HH:MM value.
 *
 * @param day Source date for year/month/day.
 * @param hhmm Time in HH:MM format.
 * @returns Date at local HH:MM on the provided day.
 */
function atLocalTime(day: Date, hhmm: string): Date {
  const { hours, minutes } = parseHHMM(hhmm);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes, 0, 0);
}

/**
 * Ensures active hour bounds are valid and not overnight.
 *
 * @param startHHMM Active-hours start in HH:MM.
 * @param endHHMM Active-hours end in HH:MM.
 */
function assertValidActiveRange(startHHMM: string, endHHMM: string): void {
  const start = parseHHMM(startHHMM);
  const end = parseHHMM(endHHMM);

  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  if (startMinutes >= endMinutes) {
    throw new Error('Active hours must be same-day with start strictly before end (no overnight ranges).');
  }
}

/**
 * Returns whether a timestamp is within local active hours.
 * Start is inclusive, end is exclusive.
 *
 * @param now Current local date/time.
 * @param startHHMM Active-hours start in HH:MM.
 * @param endHHMM Active-hours end in HH:MM.
 * @returns True when now is inside the active window.
 */
export function isWithinActiveHours(now: Date, startHHMM: string, endHHMM: string): boolean {
  assertValidActiveRange(startHHMM, endHHMM);

  const start = atLocalTime(now, startHHMM);
  const end = atLocalTime(now, endHHMM);

  return now >= start && now < end;
}

/**
 * Returns the next active-start instant from now.
 * If today's start is still ahead, returns today at start; otherwise tomorrow at start.
 *
 * @param now Current local date/time.
 * @param startHHMM Active-hours start in HH:MM.
 * @returns Next active start date.
 */
export function nextActiveStart(now: Date, startHHMM: string): Date {
  const todayStart = atLocalTime(now, startHHMM);

  if (now < todayStart) {
    return todayStart;
  }

  return new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate() + 1,
    todayStart.getHours(),
    todayStart.getMinutes(),
    0,
    0
  );
}

/**
 * Computes the next reminder timestamp according to active-hours rules.
 *
 * Rules:
 * - Outside active hours: nextActiveStart(now) + interval.
 * - Inside active hours: now + interval.
 * - If that exceeds active end: next day start + interval.
 *
 * @param now Current local date/time.
 * @param settings Settings used for interval and active-hours bounds.
 * @returns Next reminder time.
 */
export function computeNextReminderAt(now: Date, settings: Settings): Date {
  assertValidActiveRange(settings.activeStart, settings.activeEnd);

  const intervalMs = settings.reminderIntervalMinutes * 60 * 1000;

  if (!isWithinActiveHours(now, settings.activeStart, settings.activeEnd)) {
    return new Date(nextActiveStart(now, settings.activeStart).getTime() + intervalMs);
  }

  const candidate = new Date(now.getTime() + intervalMs);
  const activeEndToday = atLocalTime(now, settings.activeEnd);

  if (candidate >= activeEndToday) {
    const tomorrowStart = new Date(nextActiveStart(now, settings.activeStart));
    return new Date(tomorrowStart.getTime() + intervalMs);
  }

  return candidate;
}
