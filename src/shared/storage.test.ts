import {
  DEFAULT_RUNTIME_STATE,
  DEFAULT_SETTINGS,
  getRuntimeState,
  getSettings,
  setRuntimeState,
  setSettings
} from '@/shared';

describe('shared storage wrapper', () => {
  it('hydrates settings defaults from empty storage', async () => {
    const settings = await getSettings();

    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('merges partial settings updates correctly', async () => {
    await getSettings();

    const updated = await setSettings({ snoozeMinutes: 10, remindersEnabled: false });

    expect(updated).toEqual({
      ...DEFAULT_SETTINGS,
      snoozeMinutes: 10,
      remindersEnabled: false
    });

    const readBack = await getSettings();
    expect(readBack).toEqual(updated);
  });

  it('reads and writes runtime state with default hydration', async () => {
    const initialRuntimeState = await getRuntimeState();
    expect(initialRuntimeState).toEqual(DEFAULT_RUNTIME_STATE);

    const updatedRuntimeState = await setRuntimeState({
      nextReminderAt: 1710000000000,
      currentReminderVisible: true,
      snoozeUsedForCurrentReminder: true
    });

    expect(updatedRuntimeState).toEqual({
      ...DEFAULT_RUNTIME_STATE,
      nextReminderAt: 1710000000000,
      currentReminderVisible: true,
      snoozeUsedForCurrentReminder: true
    });

    const readBack = await getRuntimeState();
    expect(readBack).toEqual(updatedRuntimeState);
  });
});
