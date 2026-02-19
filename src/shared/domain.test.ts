import {
  DEFAULT_SETTINGS,
  STRETCH_CATEGORIES,
  StretchCategory,
  isStretchCategory,
  parseStretchCategory
} from '@/shared';

describe('shared domain defaults', () => {
  it('matches the expected settings defaults', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      remindersEnabled: true,
      reminderIntervalMinutes: 30,
      snoozeMinutes: 5,
      stretchDurationSeconds: 30,
      activeStart: '09:00',
      activeEnd: '18:00',
      disabledSuggestionCategories: []
    });
  });
});

describe('stretch category parsing', () => {
  it('includes all expected categories', () => {
    expect(STRETCH_CATEGORIES).toEqual([
      StretchCategory.Neck,
      StretchCategory.Shoulders,
      StretchCategory.Wrists,
      StretchCategory.Back,
      StretchCategory.Legs,
      StretchCategory.Feet,
      StretchCategory.Eyes
    ]);
  });

  it('accepts valid category values', () => {
    expect(isStretchCategory('neck')).toBe(true);
    expect(parseStretchCategory('eyes')).toBe(StretchCategory.Eyes);
  });

  it('rejects invalid category values', () => {
    expect(isStretchCategory('hips')).toBe(false);
    expect(isStretchCategory(10)).toBe(false);
    expect(parseStretchCategory('')).toBeNull();
  });
});
