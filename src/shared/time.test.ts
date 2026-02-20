import { DEFAULT_SETTINGS } from '@/shared/settings';
import {
  computeNextReminderAt,
  isWithinActiveHours,
  nextActiveStart,
  parseHHMM
} from '@/shared/time';

function atLocalDateTime(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

describe('parseHHMM', () => {
  it('parses valid values', () => {
    expect(parseHHMM('09:30')).toEqual({ hours: 9, minutes: 30 });
    expect(parseHHMM('00:00')).toEqual({ hours: 0, minutes: 0 });
    expect(parseHHMM('23:59')).toEqual({ hours: 23, minutes: 59 });
  });

  it('rejects malformed values', () => {
    expect(() => parseHHMM('9:30')).toThrow();
    expect(() => parseHHMM('24:00')).toThrow();
    expect(() => parseHHMM('12:60')).toThrow();
    expect(() => parseHHMM('abcd')).toThrow();
  });
});

describe('isWithinActiveHours', () => {
  const start = '09:00';
  const end = '18:00';

  it('is true exactly at start boundary', () => {
    const now = atLocalDateTime(2026, 2, 20, 9, 0);
    expect(isWithinActiveHours(now, start, end)).toBe(true);
  });

  it('is false exactly at end boundary', () => {
    const now = atLocalDateTime(2026, 2, 20, 18, 0);
    expect(isWithinActiveHours(now, start, end)).toBe(false);
  });

  it('rejects overnight active ranges', () => {
    const now = atLocalDateTime(2026, 2, 20, 10, 0);
    expect(() => isWithinActiveHours(now, '22:00', '06:00')).toThrow();
  });
});

describe('nextActiveStart', () => {
  it('returns today when start is still in the future', () => {
    const now = atLocalDateTime(2026, 2, 20, 7, 30);
    const next = nextActiveStart(now, '09:00');

    expect(next).toEqual(atLocalDateTime(2026, 2, 20, 9, 0));
  });

  it('returns tomorrow when start already passed', () => {
    const now = atLocalDateTime(2026, 2, 20, 10, 0);
    const next = nextActiveStart(now, '09:00');

    expect(next).toEqual(atLocalDateTime(2026, 2, 21, 9, 0));
  });
});

describe('computeNextReminderAt', () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    reminderIntervalMinutes: 30,
    activeStart: '09:00',
    activeEnd: '18:00'
  };

  it('inside active hours: returns now + interval', () => {
    const now = atLocalDateTime(2026, 2, 20, 10, 0);
    const next = computeNextReminderAt(now, settings);

    expect(next).toEqual(atLocalDateTime(2026, 2, 20, 10, 30));
  });

  it('near end of day: overrun resets to next day start + interval', () => {
    const now = atLocalDateTime(2026, 2, 20, 17, 45);
    const next = computeNextReminderAt(now, settings);

    expect(next).toEqual(atLocalDateTime(2026, 2, 21, 9, 30));
  });

  it('outside hours (morning): next start + interval', () => {
    const now = atLocalDateTime(2026, 2, 20, 8, 0);
    const next = computeNextReminderAt(now, settings);

    expect(next).toEqual(atLocalDateTime(2026, 2, 20, 9, 30));
  });

  it('outside hours (evening): next day start + interval', () => {
    const now = atLocalDateTime(2026, 2, 20, 19, 0);
    const next = computeNextReminderAt(now, settings);

    expect(next).toEqual(atLocalDateTime(2026, 2, 21, 9, 30));
  });

  it('rejects invalid active hour ranges', () => {
    const now = atLocalDateTime(2026, 2, 20, 10, 0);
    expect(() =>
      computeNextReminderAt(now, {
        ...settings,
        activeStart: '18:00',
        activeEnd: '09:00'
      })
    ).toThrow();
  });
});
