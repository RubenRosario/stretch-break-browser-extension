/**
 * Supported stretch categories for the MVP stretch library.
 */
export enum StretchCategory {
  Neck = 'neck',
  Shoulders = 'shoulders',
  Wrists = 'wrists',
  Back = 'back',
  Legs = 'legs',
  Feet = 'feet',
  Eyes = 'eyes'
}

/**
 * Ordered list of all supported stretch categories.
 */
export const STRETCH_CATEGORIES: readonly StretchCategory[] = [
  StretchCategory.Neck,
  StretchCategory.Shoulders,
  StretchCategory.Wrists,
  StretchCategory.Back,
  StretchCategory.Legs,
  StretchCategory.Feet,
  StretchCategory.Eyes
];

/**
 * Type guard for validating unknown values as a stretch category.
 *
 * @param value Value to validate.
 * @returns True when the value is a known category.
 */
export function isStretchCategory(value: unknown): value is StretchCategory {
  return typeof value === 'string' && STRETCH_CATEGORIES.includes(value as StretchCategory);
}

/**
 * Parses an unknown value into a stretch category.
 *
 * @param value Value to parse.
 * @returns The parsed category or `null` when invalid.
 */
export function parseStretchCategory(value: unknown): StretchCategory | null {
  return isStretchCategory(value) ? value : null;
}
