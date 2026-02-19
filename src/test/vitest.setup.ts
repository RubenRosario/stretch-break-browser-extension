import '@testing-library/jest-dom/vitest';
import { beforeEach, afterEach, vi } from 'vitest';

import { resetChromeMock } from '@/test/chrome-mocks';
import { restoreRealTimers } from '@/test/timers';

beforeEach(() => {
  resetChromeMock();
});

afterEach(() => {
  vi.restoreAllMocks();
  restoreRealTimers();
});
