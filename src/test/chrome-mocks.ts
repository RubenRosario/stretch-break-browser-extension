import { vi } from 'vitest';

/**
 * In-memory representation of `chrome.storage.local` test data.
 */
export type StorageData = Record<string, unknown>;

/**
 * Minimal alarm shape used by test stubs.
 */
export interface AlarmEntry {
  /** Alarm name. */
  name: string;
  /** When the alarm should fire in epoch milliseconds. */
  scheduledTime?: number;
  /** Optional period in minutes for repeating alarms. */
  periodInMinutes?: number;
}

/**
 * Subset of a Chrome alarm create info payload used in tests.
 */
export interface AlarmCreateInfo {
  /** Absolute trigger time in epoch milliseconds. */
  when?: number;
  /** Delay before firing, in minutes. */
  delayInMinutes?: number;
  /** Repeat interval, in minutes. */
  periodInMinutes?: number;
}

/**
 * Minimal tab shape used by test stubs.
 */
export interface TabEntry {
  /** Tab identifier. */
  id: number;
  /** Owning window identifier. */
  windowId: number;
  /** Optional tab URL. */
  url?: string;
  /** Optional active state. */
  active?: boolean;
}

/**
 * Minimal window shape used by test stubs.
 */
export interface WindowEntry {
  /** Window identifier. */
  id: number;
  /** Optional focused state. */
  focused?: boolean;
}

/**
 * Test state backing Chrome API stubs.
 */
export interface ChromeMockState {
  /** Persisted storage values for `chrome.storage.local`. */
  storageData: StorageData;
  /** Created alarms for `chrome.alarms`. */
  alarms: Map<string, AlarmEntry>;
  /** Existing tab records for `chrome.tabs`. */
  tabs: Map<number, TabEntry>;
  /** Existing window records for `chrome.windows`. */
  windows: Map<number, WindowEntry>;
}

/**
 * Minimal Chrome API shape needed for unit tests.
 */
export interface ChromeMock {
  /** Backing mutable state used by mocks. */
  state: ChromeMockState;
  /** Minimal storage API mocks. */
  storage: {
    local: {
      get: ReturnType<typeof vi.fn>;
      set: ReturnType<typeof vi.fn>;
      remove: ReturnType<typeof vi.fn>;
      clear: ReturnType<typeof vi.fn>;
    };
  };
  /** Minimal alarms API mocks. */
  alarms: {
    create: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    getAll: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    clearAll: ReturnType<typeof vi.fn>;
  };
  /** Minimal runtime API mocks. */
  runtime: {
    sendMessage: ReturnType<typeof vi.fn>;
    onMessage: {
      addListener: ReturnType<typeof vi.fn>;
      removeListener: ReturnType<typeof vi.fn>;
      hasListener: ReturnType<typeof vi.fn>;
    };
  };
  /** Minimal tabs API mocks. */
  tabs: {
    get: ReturnType<typeof vi.fn>;
    query: ReturnType<typeof vi.fn>;
    sendMessage: ReturnType<typeof vi.fn>;
    onActivated: {
      addListener: ReturnType<typeof vi.fn>;
      removeListener: ReturnType<typeof vi.fn>;
      hasListener: ReturnType<typeof vi.fn>;
    };
    onUpdated: {
      addListener: ReturnType<typeof vi.fn>;
      removeListener: ReturnType<typeof vi.fn>;
      hasListener: ReturnType<typeof vi.fn>;
    };
    onRemoved: {
      addListener: ReturnType<typeof vi.fn>;
      removeListener: ReturnType<typeof vi.fn>;
      hasListener: ReturnType<typeof vi.fn>;
    };
  };
  /** Minimal windows API mocks. */
  windows: {
    get: ReturnType<typeof vi.fn>;
    getAll: ReturnType<typeof vi.fn>;
    getCurrent: ReturnType<typeof vi.fn>;
    onFocusChanged: {
      addListener: ReturnType<typeof vi.fn>;
      removeListener: ReturnType<typeof vi.fn>;
      hasListener: ReturnType<typeof vi.fn>;
    };
    onRemoved: {
      addListener: ReturnType<typeof vi.fn>;
      removeListener: ReturnType<typeof vi.fn>;
      hasListener: ReturnType<typeof vi.fn>;
    };
  };
}

/**
 * Builds a deterministic `chrome` mock for unit tests.
 *
 * @returns The mocked Chrome API object and backing state.
 */
export function createChromeMock(): ChromeMock {
  const state: ChromeMockState = {
    storageData: {},
    alarms: new Map<string, AlarmEntry>(),
    tabs: new Map<number, TabEntry>(),
    windows: new Map<number, WindowEntry>()
  };

  const storageGet = vi.fn(async (keys?: string | string[] | Record<string, unknown>) => {
    if (keys == null) {
      return { ...state.storageData };
    }

    if (typeof keys === 'string') {
      return { [keys]: state.storageData[keys] };
    }

    if (Array.isArray(keys)) {
      return keys.reduce<Record<string, unknown>>((result, key) => {
        result[key] = state.storageData[key];
        return result;
      }, {});
    }

    return Object.entries(keys).reduce<Record<string, unknown>>((result, [key, fallback]) => {
      result[key] = key in state.storageData ? state.storageData[key] : fallback;
      return result;
    }, {});
  });

  const storageSet = vi.fn(async (items: Record<string, unknown>) => {
    Object.assign(state.storageData, items);
  });

  const storageRemove = vi.fn(async (keys: string | string[]) => {
    const keysToRemove = Array.isArray(keys) ? keys : [keys];
    keysToRemove.forEach((key) => {
      delete state.storageData[key];
    });
  });

  const storageClear = vi.fn(async () => {
    state.storageData = {};
  });

  const alarmCreate = vi.fn((name: string, info?: AlarmCreateInfo) => {
    const alarm: AlarmEntry = {
      name,
      scheduledTime: info?.when,
      periodInMinutes: info?.periodInMinutes
    };
    state.alarms.set(name, alarm);
  });

  const alarmGet = vi.fn(async (name: string) => state.alarms.get(name));
  const alarmGetAll = vi.fn(async () => Array.from(state.alarms.values()));
  const alarmClear = vi.fn(async (name: string) => state.alarms.delete(name));
  const alarmClearAll = vi.fn(async () => {
    state.alarms.clear();
    return true;
  });

  const tabsGet = vi.fn(async (tabId: number) => state.tabs.get(tabId));
  const tabsQuery = vi.fn(async () => Array.from(state.tabs.values()));
  const tabsSendMessage = vi.fn(async () => undefined);

  const windowsGet = vi.fn(async (windowId: number) => state.windows.get(windowId));
  const windowsGetAll = vi.fn(async () => Array.from(state.windows.values()));
  const windowsGetCurrent = vi.fn(async () => {
    const focusedWindow = Array.from(state.windows.values()).find((window) => window.focused);
    return focusedWindow ?? Array.from(state.windows.values())[0];
  });

  return {
    state,
    storage: {
      local: {
        get: storageGet,
        set: storageSet,
        remove: storageRemove,
        clear: storageClear
      }
    },
    alarms: {
      create: alarmCreate,
      get: alarmGet,
      getAll: alarmGetAll,
      clear: alarmClear,
      clearAll: alarmClearAll
    },
    runtime: {
      sendMessage: vi.fn(async () => undefined),
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(() => false)
      }
    },
    tabs: {
      get: tabsGet,
      query: tabsQuery,
      sendMessage: tabsSendMessage,
      onActivated: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(() => false)
      },
      onUpdated: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(() => false)
      },
      onRemoved: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(() => false)
      }
    },
    windows: {
      get: windowsGet,
      getAll: windowsGetAll,
      getCurrent: windowsGetCurrent,
      onFocusChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(() => false)
      },
      onRemoved: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(() => false)
      }
    }
  };
}

/**
 * Reinitializes global Chrome API stubs for each test.
 *
 * @returns The newly created Chrome mock instance.
 */
export function resetChromeMock(): ChromeMock {
  const chromeMock = createChromeMock();
  Object.defineProperty(globalThis, 'chrome', {
    configurable: true,
    writable: true,
    value: chromeMock
  });

  return chromeMock;
}
