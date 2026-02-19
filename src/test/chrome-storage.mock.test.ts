describe('chrome.storage.local mock', () => {
  it('supports set/get in tests without a real browser', async () => {
    await chrome.storage.local.set({ remindersEnabled: true, interval: 30 });

    const value = await chrome.storage.local.get(['remindersEnabled', 'interval']);

    expect(value).toEqual({ remindersEnabled: true, interval: 30 });
  });

  it('supports default values when keys are missing', async () => {
    const value = await chrome.storage.local.get({ snoozeMinutes: 5 });

    expect(value).toEqual({ snoozeMinutes: 5 });
  });
});
