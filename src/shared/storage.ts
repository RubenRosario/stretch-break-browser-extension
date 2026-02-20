import { DEFAULT_SETTINGS, type Settings } from '@/shared/settings';

/** Storage schema key for forward-compatible migrations. */
const SCHEMA_VERSION_KEY = 'schemaVersion';
/** Current storage schema version. */
const CURRENT_SCHEMA_VERSION = 1;
/** Storage key for persisted user settings. */
const SETTINGS_KEY = 'settings';
/** Storage key for persisted runtime state. */
const RUNTIME_STATE_KEY = 'runtimeState';

/**
 * Persisted runtime state used by the reminder engine wiring.
 */
export interface RuntimeState {
  /** Next reminder timestamp in epoch milliseconds, or null when unscheduled. */
  nextReminderAt: number | null;
  /** Timestamp until reminders are skipped for today. */
  skipUntil: number | null;
  /** Whether snooze was already used for the current reminder. */
  snoozeUsedForCurrentReminder: boolean;
  /** Whether reminder overlay is currently visible. */
  currentReminderVisible: boolean;
  /** Last successful library fetch timestamp in epoch milliseconds. */
  lastLibraryFetchAt: number | null;
}

/**
 * Defaults for persisted runtime state.
 */
export const DEFAULT_RUNTIME_STATE: RuntimeState = {
  nextReminderAt: null,
  skipUntil: null,
  snoozeUsedForCurrentReminder: false,
  currentReminderVisible: false,
  lastLibraryFetchAt: null
};

/**
 * Ensures the storage schema version key is set.
 */
async function ensureSchemaVersion(): Promise<void> {
  const result = await chrome.storage.local.get({ [SCHEMA_VERSION_KEY]: null });
  if (result[SCHEMA_VERSION_KEY] !== CURRENT_SCHEMA_VERSION) {
    await chrome.storage.local.set({ [SCHEMA_VERSION_KEY]: CURRENT_SCHEMA_VERSION });
  }
}

/**
 * Returns effective settings by merging persisted values over defaults.
 *
 * @returns Hydrated settings.
 */
export async function getSettings(): Promise<Settings> {
  await ensureSchemaVersion();

  const result = await chrome.storage.local.get({ [SETTINGS_KEY]: null });
  const stored = result[SETTINGS_KEY];

  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    ...(typeof stored === 'object' && stored !== null ? (stored as Partial<Settings>) : {})
  };

  // Persist hydrated settings to keep storage shape stable over time.
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  return settings;
}

/**
 * Applies a partial update to persisted settings.
 *
 * @param patch Partial settings update.
 * @returns Updated full settings object.
 */
export async function setSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const merged: Settings = {
    ...current,
    ...patch
  };

  await chrome.storage.local.set({ [SETTINGS_KEY]: merged });
  return merged;
}

/**
 * Returns runtime state by merging persisted values over defaults.
 *
 * @returns Hydrated runtime state.
 */
export async function getRuntimeState(): Promise<RuntimeState> {
  await ensureSchemaVersion();

  const result = await chrome.storage.local.get({ [RUNTIME_STATE_KEY]: null });
  const stored = result[RUNTIME_STATE_KEY];

  const runtimeState: RuntimeState = {
    ...DEFAULT_RUNTIME_STATE,
    ...(typeof stored === 'object' && stored !== null ? (stored as Partial<RuntimeState>) : {})
  };

  await chrome.storage.local.set({ [RUNTIME_STATE_KEY]: runtimeState });
  return runtimeState;
}

/**
 * Applies a partial update to persisted runtime state.
 *
 * @param patch Partial runtime state update.
 * @returns Updated full runtime state object.
 */
export async function setRuntimeState(patch: Partial<RuntimeState>): Promise<RuntimeState> {
  const current = await getRuntimeState();
  const merged: RuntimeState = {
    ...current,
    ...patch
  };

  await chrome.storage.local.set({ [RUNTIME_STATE_KEY]: merged });
  return merged;
}
