# Stretch Break — TODO Checklist (MVP)

> Use this as a living checklist. Check items as you complete them.

---

## 0) Repo & Tooling

- [x] Create WXT project scaffold (MV3, React, TypeScript)
- [x] Confirm entrypoints exist:
  - [x] `background` (service worker)
  - [x] `content script` (overlay injector)
  - [x] `popup` (toolbar UI)
- [x] Add scripts:
  - [x] `dev`
  - [x] `build`
  - [x] `typecheck`
  - [x] `lint`
  - [x] `test`
- [x] Add formatting (Prettier) + lint rules (ESLint)
- [x] Add basic README:
  - [x] Install deps
  - [x] Run dev (load unpacked extension)
  - [x] Run tests
  - [x] Build
- [x] Confirm:
  - [x] `pnpm dev` runs
  - [x] `pnpm build` succeeds
  - [x] `pnpm test` passes

---

## 1) UI Foundation (Tailwind + shadcn/ui + Dark Mode)

- [x] Install and configure Tailwind CSS
- [x] Install shadcn/ui and initialize components config
- [x] Create shared theme/tokens used by popup + overlay
- [x] Confirm dark mode strategy (match OS/browser preference)
- [x] Create shared UI components folder:
  - [x] `Button`
  - [x] `Card`
  - [x] `Switch`
  - [x] `Input`
  - [x] `Select`
- [x] Add a “hello UI” Popup screen using shadcn components
- [x] Add a minimal Overlay placeholder UI (no logic)
- [x] Test:
  - [x] Popup renders title text
  - [x] Overlay component renders in a “stub mode”

---

## 2) Testing Harness

- [x] Setup Vitest
- [x] Setup React Testing Library
- [x] Setup `@testing-library/jest-dom`
- [x] Add test setup file (`vitest.setup.ts`)
- [x] Add Chrome API mock strategy:
  - [x] `chrome.storage.local`
  - [x] `chrome.alarms`
  - [x] `chrome.runtime.sendMessage/onMessage`
  - [x] `chrome.tabs` and `chrome.windows` stubs (basic)
- [x] Add helpers:
  - [x] fake timers utilities
  - [x] reset mocks per test
- [x] Add at least one passing unit test that uses chrome mocks

---

## 3) Shared Domain Models (Types)

- [x] Create `src/shared/` module boundary
- [x] Define categories enum:
  - [x] neck
  - [x] shoulders
  - [x] wrists
  - [x] back
  - [x] legs
  - [x] feet
  - [x] eyes
- [x] Define `Settings` type + defaults:
  - [x] `remindersEnabled` (default `true`)
  - [x] `reminderIntervalMinutes` (default `30`)
  - [x] `snoozeMinutes` (default `5`)
  - [x] `stretchDurationSeconds` (default `30`)
  - [x] `activeStart` (default `"09:00"`)
  - [x] `activeEnd` (default `"18:00"`)
  - [x] `disabledSuggestionCategories` (default `[]`)
- [x] Define `Stretch` model:
  - [x] `id`
  - [x] `name`
  - [x] `category`
  - [x] `gifUrl`
  - [x] `instructions` (English-only)
- [x] Define message protocol types:
  - [x] Popup/Content → Background commands
  - [x] Background → Content UI messages
- [x] Tests:
  - [x] Defaults match expected values
  - [x] Categories validate correctly

---

## 4) Storage Layer (chrome.storage.local)

- [x] Create typed wrapper `src/shared/storage.ts`
- [x] Implement:
  - [x] `getSettings()` (hydrates defaults)
  - [x] `setSettings(partial)` (merges patch)
  - [x] `getRuntimeState()`
  - [x] `setRuntimeState(partial)`
- [x] Define runtime state shape (persisted):
  - [x] `nextReminderAt` (timestamp | null)
  - [x] `skipUntil` (timestamp | null)
  - [x] `snoozeUsedForCurrentReminder` (boolean)
  - [x] `currentReminderVisible` (boolean)
  - [ ] `session` (mode + windowId + tabId + startedAt + any needed ids)
  - [x] `lastLibraryFetchAt` (timestamp | null)
- [x] Add schema version key (for future migrations)
- [x] Tests:
  - [x] Empty storage → defaults returned
  - [x] Partial update merges correctly
  - [x] Runtime state read/write works

---

## 5) Time & Active Hours Utilities (Pure + Tested)

- [ ] Create `src/shared/time.ts`
- [ ] Implement:
  - [ ] `parseHHMM()`
  - [ ] `isWithinActiveHours()` (no overnight support)
  - [ ] `nextActiveStart()`
  - [ ] `computeNextReminderAt(now, settings)`
- [ ] Tests (must be thorough):
  - [ ] Exact start boundary
  - [ ] Exact end boundary
  - [ ] Just before end + interval would exceed end
  - [ ] Outside hours (morning before start)
  - [ ] Outside hours (evening after end)
  - [ ] Invalid inputs (reject overnight and malformed)

---

## 6) Remote Stretch Library Module (Fixed URL)

- [ ] Create `src/shared/library.ts`
- [ ] Hardcode base URL (MVP):
  - [ ] `LIBRARY_URL = https://cdn.yourdomain.com/stretch-break/library.json`
- [ ] Implement fetch + validation:
  - [ ] Validate JSON has `stretches[]`
  - [ ] Validate each stretch field exists
  - [ ] Validate category is valid enum
- [ ] Implement:
  - [ ] `fetchLibrary()`
  - [ ] `getCachedLibrary()` (optional; for UI display if you choose)
  - [ ] `ensureLibraryFresh(maxAgeHours=24)`
- [ ] Store:
  - [ ] library payload or minimally store `lastLibraryFetchAt`
- [ ] Failure policy (MVP):
  - [ ] No offline fallback at break start
  - [ ] Caller must block break and show error
- [ ] Tests:
  - [ ] Valid JSON passes
  - [ ] Invalid schema fails
  - [ ] Invalid category fails
  - [ ] ensureLibraryFresh fetches when stale
  - [ ] fetch failure surfaces error

---

## 7) Reminder Engine (Pure State Machine)

- [ ] Create `src/background/engine.ts` (pure)
- [ ] Define `EngineState` (persistable subset)
- [ ] Define events:
  - [ ] INIT
  - [ ] TICK_ALARM
  - [ ] REMINDER_AUTO_DISMISS
  - [ ] USER_SNOOZE
  - [ ] USER_DISMISS
  - [ ] USER_SKIP_TODAY
  - [ ] USER_TRIGGER_BREAK_NOW
  - [ ] USER_START_BREAK
  - [ ] USER_END_BREAK
  - [ ] TAB_CHANGED
  - [ ] TAB_CLOSED
  - [ ] WINDOW_CLOSED
- [ ] Define actions:
  - [ ] schedule reminder alarm
  - [ ] schedule auto-dismiss alarm
  - [ ] show overlay in mode
  - [ ] hide overlay
  - [ ] reset timer
  - [ ] end session
- [ ] Implement rules:
  - [ ] Interval: 30 minutes default (settings-driven)
  - [ ] Timer counts only during active hours
  - [ ] Snooze allowed once per reminder; after snooze ends reset 30-min cycle
  - [ ] Dismiss resets 30-min cycle
  - [ ] Skip today disables until next day active start
  - [ ] Auto-dismiss after 2 min resets 30-min cycle
  - [ ] Only show overlay on normal pages (http/https)
  - [ ] Overlay only in active/focused window; move with active tab
  - [ ] Closing window during break ends break and resets timer
- [ ] Tests (must be extensive):
  - [ ] Init computes next reminder correctly inside/outside hours
  - [ ] Snooze once only
  - [ ] Dismiss resets
  - [ ] Skip today behavior
  - [ ] Auto-dismiss behavior
  - [ ] Window close ends break
  - [ ] Tab change moves overlay

---

## 8) Background Wiring (Chrome APIs)

- [ ] Create adapter in background entrypoint to:
  - [ ] Load settings + runtime state
  - [ ] Dispatch events to engine
  - [ ] Persist state after each dispatch
  - [ ] Execute actions via Chrome APIs
- [ ] Alarms:
  - [ ] Schedule reminder alarm
  - [ ] Schedule reminder auto-dismiss alarm (2 min)
  - [ ] Daily library refresh alarm
- [ ] Event listeners:
  - [ ] `chrome.alarms.onAlarm`
  - [ ] `chrome.tabs.onActivated`
  - [ ] `chrome.tabs.onUpdated` (URL changes)
  - [ ] `chrome.tabs.onRemoved`
  - [ ] `chrome.windows.onFocusChanged`
  - [ ] `chrome.windows.onRemoved`
- [ ] Normal page detection:
  - [ ] Only `http` and `https` considered eligible
  - [ ] Others → wait until eligible page active
- [ ] Messaging:
  - [ ] `chrome.runtime.onMessage` for popup/content commands
- [ ] Tests:
  - [ ] Alarms scheduled with correct times
  - [ ] Messages sent to correct tab/window

---

## 9) Content Script Overlay Shell (Shadow DOM + React)

- [ ] Implement overlay host element injection
- [ ] Create Shadow Root container
- [ ] Inject compiled Tailwind/shadcn CSS into Shadow Root via `<style>` (runtime injection)
- [ ] Mount React overlay app into Shadow Root
- [ ] Implement message listener:
  - [ ] SHOW_REMINDER
  - [ ] SHOW_SELECTION
  - [ ] SHOW_RUNNER
  - [ ] SHOW_ERROR
  - [ ] HIDE_OVERLAY
  - [ ] UPDATE_SESSION_STATE (if used)
- [ ] Ensure:
  - [ ] Overlay position top-right
  - [ ] Non-blocking (page remains usable)
  - [ ] Consistent styling across sites
- [ ] Tests:
  - [ ] Overlay renders each mode
  - [ ] Overlay reacts to message updates

---

## 10) Popup UI (Settings + Status + Actions)

- [ ] Implement popup layout (shared theme)
- [ ] Status section:
  - [ ] Reminders On/Off
  - [ ] Within active hours
  - [ ] Next reminder countdown (live while popup open)
- [ ] Buttons:
  - [ ] Trigger break now (sends command + resets timer)
  - [ ] Show overlay (only if overlay/session active)
- [ ] Settings controls (persisted):
  - [ ] master toggle (remindersEnabled)
  - [ ] reminder interval minutes
  - [ ] snooze minutes
  - [ ] stretch duration seconds
  - [ ] active hours start/end (validate no overnight)
  - [ ] category suggestion toggles (disabledSuggestionCategories)
- [ ] Tests:
  - [ ] Renders status
  - [ ] Countdown updates with fake timers
  - [ ] Changing setting persists

---

## 11) Reminder Overlay UI (End-to-End)

- [ ] Build Reminder mode UI:
  - [ ] Start Break
  - [ ] Snooze (one-time per reminder)
  - [ ] Dismiss
  - [ ] Skip today
  - [ ] Settings (instructional only if needed)
- [ ] Implement auto-dismiss UX:
  - [ ] Overlay disappears after 2 minutes idle
  - [ ] Timer resets (background-driven)
- [ ] Ensure no stretch preview in reminder mode
- [ ] Tests:
  - [ ] Snooze disabled after used
  - [ ] Auto-dismiss triggers expected background action
  - [ ] Dismiss and Skip today dispatch expected messages

---

## 12) Stretch Selection UI

- [ ] Ensure remote library is available when entering selection:
  - [ ] On Start Break -> background calls `ensureLibraryFresh()`
  - [ ] On failure -> show error mode
  - [ ] On success -> show selection mode
- [ ] Suggested set:
  - [ ] One stretch per category (excluding disabled suggestion categories)
  - [ ] Stable deterministic suggestion (alphabetical by name within category)
- [ ] Start button:
  - [ ] Disabled unless ≥ 1 stretch selected
- [ ] Show All view:
  - [ ] Grouped by category
  - [ ] Alphabetical
  - [ ] GIF thumbnails inline
  - [ ] User can leave categories unselected → fall back to suggested
  - [ ] Disabled categories still listed; selecting enables for session
- [ ] Selection ordering:
  - [ ] Runner order = user-selected/edited order
- [ ] Tests:
  - [ ] Cannot start with 0 selections
  - [ ] Fallback to suggested when unselected
  - [ ] Grouping + sorting correct
  - [ ] Disabled category selection allowed

---

## 13) Break Runner UI

- [ ] Runner displays:
  - [ ] Looping GIF
  - [ ] Instructions text
  - [ ] Countdown timer (stretchDurationSeconds)
- [ ] Controls:
  - [ ] End Break only
  - [ ] No pause/minimize
- [ ] Unselect in runner:
  - [ ] Finish current stretch
  - [ ] Then skip removed stretches
- [ ] Completion:
  - [ ] Congratulatory message
  - [ ] Auto-close after 5 seconds
- [ ] Cross-tab reliability:
  - [ ] Runner state survives tab switches (recommended: background owns runner state)
- [ ] Tests:
  - [ ] Timer ticks and advances
  - [ ] Unselect behavior after current completes
  - [ ] End break stops session
  - [ ] Completion autoclose after 5s

---

## 14) Tab/Window Movement & Edge Cases

- [ ] Overlay moves to newly active tab (reminder + runner)
- [ ] Only active/focused window shows overlay
- [ ] Closing tab hosting overlay:
  - [ ] Session continues in remaining tab
- [ ] Closing window hosting overlay:
  - [ ] Break ends
  - [ ] Timer resets
- [ ] Unsupported pages:
  - [ ] Wait until normal page (http/https) becomes active
- [ ] Tests:
  - [ ] Tab switch moves overlay
  - [ ] Window close ends break + resets timer
  - [ ] No overlay on chrome:// pages

---

## 15) Error UI (Retry Only)

- [ ] Implement error screen:
  - [ ] Generic message (no technical details)
  - [ ] Retry button only
- [ ] Retry behavior:
  - [ ] Re-attempt library fetch
  - [ ] Success -> back to selection
  - [ ] Failure -> remain on error
- [ ] Tests:
  - [ ] Retry success path
  - [ ] Retry failure path

---

## 16) Accessibility & UX Polish

- [ ] Add ARIA labels to key controls
- [ ] Ensure screen-reader friendly headings and text
- [ ] Focus management:
  - [ ] When overlay opens, focus goes to overlay container or title
- [ ] Verify non-blocking overlay does not break page interaction
- [ ] Verify dark mode styles in popup and overlay
- [ ] Tests:
  - [ ] aria-label presence checks
  - [ ] basic focus test

---

## 17) Permissions & Manifest Verification

- [ ] Ensure manifest includes:
  - [ ] `<all_urls>`
  - [ ] `storage`
  - [ ] `alarms`
  - [ ] `scripting`
  - [ ] `activeTab`
- [ ] Confirm content scripts are declared correctly for `<all_urls>`
- [ ] Confirm extension behaves when site access is restricted:
  - [ ] Wait until permitted page active

---

## 18) Smoke E2E Test + Release Checks

- [ ] Add Playwright smoke test:
  - [ ] Load built extension
  - [ ] Open a normal webpage
  - [ ] Open popup
  - [ ] Click “Trigger break now”
  - [ ] Assert overlay appears
- [ ] Add `release-check` script:
  - [ ] typecheck
  - [ ] unit tests
  - [ ] build
  - [ ] smoke test
- [ ] Validate on browsers:
  - [ ] Chrome
  - [ ] Edge
  - [ ] Brave

---

## 19) Out of Scope (MVP) — Confirm Not Implementing

- [ ] Incognito support
- [ ] Offline stretch cache
- [ ] Multi-language support
- [ ] Sounds
- [ ] Site allowlist/blocklist
- [ ] Analytics/streaks/history
- [ ] Onboarding flow
