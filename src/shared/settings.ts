import { type StretchCategory } from '@/shared/categories';

/**
 * Persisted user settings used by reminder and break features.
 */
export interface Settings {
  /** Global reminders on/off switch. */
  remindersEnabled: boolean;
  /** Time between reminders in minutes. */
  reminderIntervalMinutes: number;
  /** Snooze duration in minutes. */
  snoozeMinutes: number;
  /** Per-stretch duration in seconds during a break. */
  stretchDurationSeconds: number;
  /** Daily active hours start time in local HH:MM format. */
  activeStart: string;
  /** Daily active hours end time in local HH:MM format. */
  activeEnd: string;
  /** Categories excluded from suggested set generation. */
  disabledSuggestionCategories: StretchCategory[];
}

/**
 * Default settings for new installations.
 */
export const DEFAULT_SETTINGS: Settings = {
  remindersEnabled: true,
  reminderIntervalMinutes: 30,
  snoozeMinutes: 5,
  stretchDurationSeconds: 30,
  activeStart: '09:00',
  activeEnd: '18:00',
  disabledSuggestionCategories: []
};
