import { vi } from 'vitest';

/**
 * Enables fake timers for a test.
 */
export function enableFakeTimers(): void {
  vi.useFakeTimers();
}

/**
 * Advances fake timers and flushes pending microtasks.
 *
 * @param ms Milliseconds to advance.
 */
export async function advanceFakeTime(ms: number): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
}

/**
 * Restores real timers and clears pending timer state.
 */
export function restoreRealTimers(): void {
  vi.clearAllTimers();
  vi.useRealTimers();
}
