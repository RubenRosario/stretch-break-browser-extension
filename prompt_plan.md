# Stretch Break — Prompt Plan (Blueprint + TDD Codegen Prompts)

## Blueprint

### Phase A — Project foundation
1. Scaffold WXT project with React + TS
2. Add Tailwind + shadcn/ui and shared theme
3. Establish testing harness (Vitest + React Testing Library), lint/format scripts, CI-ready commands

### Phase B — Core domain and persistence
4. Define domain types and defaults (settings, categories, stretch model, message protocol)
5. Build a typed `chrome.storage.local` wrapper + migrations/default hydration
6. Build time/active-hours calculator (pure functions) with strong unit tests

### Phase C — Background orchestration (MV3 service worker)
7. Implement a **pure reminder state machine** (testable) that outputs “actions” (schedule alarm, show overlay, etc.)
8. Wire it to Chrome APIs (`alarms`, `tabs`, `windows`, `runtime`) and persist minimal runtime state
9. Implement message handlers (popup/content → background) for all commands

### Phase D — UI shells (Shadow DOM overlay + popup)
10. Create content-script overlay shell using Shadow DOM UI mounting and message-driven rendering (WXT supports Shadow-root UI patterns for content scripts).
11. Create toolbar popup shell with shared Tailwind/shadcn components and a live “next reminder” countdown

### Phase E — Features
12. Remote stretch library module (fixed URL, validation, daily refresh rules, failure mode)
13. Reminder overlay UI (Start/Snooze/Dismiss/Skip/Settings + auto-dismiss)
14. Stretch selection UI (suggested set + “show all” list with inline GIF thumbnails)
15. Break runner UI (sequential countdown, unselect behavior, end break, completion autoclose)

### Phase F — Cross-tab/window behavior + polish
16. Move overlay across tabs/windows per spec and handle closure edge-cases
17. Accessibility and dark-mode checks
18. Add a smoke E2E test that loads the extension and validates “Trigger break now” shows the overlay

---

## Milestones → Right-sized implementation steps (final)
- M1: Repo scaffold + test harness + UI baseline
- M2: Domain types + storage + time logic
- M3: Background reminder engine (pure + wired)
- M4: Messaging protocol + UI shells wired end-to-end
- M5: Remote library + reminder actions
- M6: Selection + runner
- M7: Tab/window movement + polish + smoke test

---

## Code-generation prompts (test-driven, incremental)

### Prompt 01 — Scaffold project and baseline commands
```text
You are implementing Stretch Break (MV3) using WXT + React + TypeScript.

Goal for this step:
- Create a new WXT project scaffold with React + TS entrypoints: background, content script, popup.
- Ensure `pnpm test` (or npm/yarn equivalent) runs and passes even if there are no tests yet.
- Add baseline scripts: dev, build, lint, test.

Constraints:
- Do not implement any product logic yet.
- Keep the code compiling and extension building.

Deliverables:
- WXT scaffold with `src/entrypoints/background.ts`, `src/entrypoints/content.ts(x)`, `src/entrypoints/popup/*` (exact names per WXT defaults).
- `wxt.config.ts` with MV3 and placeholder manifest fields.
- README with local dev instructions.

Verification:
- `pnpm dev` starts WXT dev mode
- `pnpm build` succeeds
- `pnpm test` succeeds (even if zero tests)
```

### Prompt 02 — Add Tailwind + shadcn/ui + shared theme
```text
Goal for this step:
- Add Tailwind CSS and shadcn/ui to the project.
- Establish a shared theme and dark-mode support for popup + overlay UI.
- Keep everything compiling and building.

Requirements:
- Use a single shared Tailwind config and a shared global CSS entry.
- Popup and content overlay must be able to consume shared components/theme.

Implementation notes:
- Add a minimal shadcn Button component and a basic Card component.
- Popup should render a simple “Stretch Break” card with a button (no logic).

Testing:
- Add 1 simple React component test (React Testing Library) that renders the popup root and asserts the title is visible.

Acceptance:
- `pnpm test` passes with the new UI test.
- `pnpm build` succeeds.
```

### Prompt 03 — Setup Vitest with WXT-friendly environment + test utilities
```text
Goal for this step:
- Configure Vitest for a WXT project.
- Add a chrome API mock strategy suitable for unit tests.
- Add test utilities for:
  - fake timers
  - mocking `chrome.storage.local`
  - mocking `chrome.alarms`

Requirements:
- Use Vitest and a setup file that installs:
  - @testing-library/jest-dom
  - minimal `globalThis.chrome` stubs
- Add a sample unit test that uses the chrome mocks (storage get/set).

Acceptance:
- Tests run in CI-like environment without a real browser.
- No changes to production logic yet beyond adding safe abstractions/mocks.
```

### Prompt 04 — Define shared domain types + defaults (no behavior yet)
```text
Goal for this step:
Create a `src/shared/` domain layer with typed models and defaults.

Models:
- Categories enum: neck, shoulders, wrists, back, legs, feet, eyes
- Settings:
  - remindersEnabled (boolean, default true)
  - reminderIntervalMinutes (default 30)
  - snoozeMinutes (default 5)
  - stretchDurationSeconds (default 30)
  - activeStart (default "09:00")
  - activeEnd (default "18:00")
  - disabledSuggestionCategories (array of categories, default [])
- Stretch model:
  - id, name, category, gifUrl, instructions (English-only)

Message protocol types:
- Commands from popup/content to background:
  - TRIGGER_BREAK_NOW
  - OPEN_SETTINGS (optional/no-op)
  - REMINDER_SNOOZE
  - REMINDER_DISMISS
  - REMINDER_SKIP_TODAY
  - BREAK_START (request stretch library)
  - BREAK_END
  - LIBRARY_RETRY_FETCH
  - OVERLAY_SHOW_REQUEST / OVERLAY_HIDE_REQUEST (if needed)
- Background → content messages:
  - SHOW_REMINDER
  - SHOW_SELECTION
  - SHOW_RUNNER
  - SHOW_ERROR
  - HIDE_OVERLAY
  - UPDATE_SESSION_STATE

Tests:
- Unit tests asserting default settings shape and parsing category types.

Acceptance:
- No runtime behavior change, only typed foundations.
```

### Prompt 05 — Typed storage layer with defaults hydration
```text
Goal:
Implement a typed storage wrapper around `chrome.storage.local` in `src/shared/storage.ts`.

Requirements:
- Provide functions:
  - getSettings(): Promise<Settings> (hydrates defaults if missing)
  - setSettings(patch: Partial<Settings>): Promise<Settings>
  - getRuntimeState()/setRuntimeState() for minimal persisted runtime state (as per spec: snooze state, skipUntil, timer state, overlay active state, lastFetch timestamp).
- Include a simple schema version number for future migrations, but no migrations needed now.

Tests:
- Unit tests for:
  - defaults are applied when storage empty
  - partial updates merge correctly
  - runtime state read/write works

Acceptance:
- Storage layer is used by popup to read settings (still no reminder logic).
```

### Prompt 06 — Time/active-hours pure utilities (heavy unit testing)
```text
Goal:
Implement pure time utilities in `src/shared/time.ts` (no chrome APIs inside).

Functions:
- parseHHMM("09:30") -> { hours, minutes } or throws
- isWithinActiveHours(now: Date, startHHMM: string, endHHMM: string) -> boolean (no overnight allowed)
- nextActiveStart(now: Date, startHHMM: string) -> Date (today if in future; else tomorrow)
- computeNextReminderAt(now: Date, settings: Settings) -> Date
  Rules:
  - If outside active hours: next reminder = nextActiveStart + interval
  - If inside active hours: next reminder = now + interval
  - If that time exceeds activeEnd: next reminder = next day nextActiveStart + interval (fresh start)

Tests:
- Cover boundary cases: exactly at start/end, near end of day, outside hours, and invalid ranges.

Acceptance:
- All time decisions are test-covered and deterministic.
```

### Prompt 07 — Remote stretch library module (fixed URL + validation)
```text
Goal:
Create `src/shared/library.ts` to fetch and validate the remote stretch library.

Requirements:
- Hardcoded URL: `LIBRARY_URL = "https://cdn.yourdomain.com/stretch-break/library.json"` (placeholder constant)
- No authentication
- Validation:
  - Ensure `stretches` is an array
  - Each stretch has required fields and category is valid
- Storage:
  - store the library JSON in `chrome.storage.local` (or keep in memory + last fetch timestamp)
  - store lastFetch timestamp
- Expose:
  - getCachedLibrary()
  - fetchLibrary()
  - ensureLibraryFresh(maxAgeHours=24)

Failure behavior:
- Do NOT provide offline fallback at break start; caller decides to block start and show error.

Tests:
- Mock fetch success/failure
- Validate parsing rejects invalid category
- ensureLibraryFresh triggers fetch when stale

Acceptance:
- No UI yet, but background can call ensureLibraryFresh.
```

### Prompt 08 — Background reminder engine as a pure state machine
```text
Goal:
Implement a pure reminder engine in `src/background/engine.ts` that is fully unit-testable.

Model:
- EngineState (persistable subset):
  - nextReminderAt (number timestamp)
  - skipUntil (number timestamp | null)
  - snoozeUsedForCurrentReminder (boolean)
  - currentReminderVisible (boolean)
  - activeSession: null | { mode: "REMINDER"|"SELECTION"|"RUNNER"|"ERROR", windowId, tabId, startedAt }
- Events:
  - INIT(now)
  - TICK_ALARM(now)
  - REMINDER_AUTO_DISMISS(now)
  - USER_SNOOZE(now)
  - USER_DISMISS(now)
  - USER_SKIP_TODAY(now)
  - USER_TRIGGER_BREAK_NOW(now)
  - USER_START_BREAK(now)
  - USER_END_BREAK(now)
  - TAB_CHANGED(now, windowId, tabId, url)
  - TAB_CLOSED(now, tabId)
  - WINDOW_CLOSED(now, windowId)

Engine outputs actions:
- SCHEDULE_REMINDER(at)
- SCHEDULE_AUTO_DISMISS(at)
- SHOW_OVERLAY(mode)
- HIDE_OVERLAY
- RESET_TIMER
- END_SESSION
- NOOP

Rules to implement per spec:
- snooze allowed once; after snooze ends reset full 30-min timer
- dismiss resets full 30-min timer
- skip today disables until next day's active start; next reminder at start+interval
- auto-dismiss after 2 minutes resets full 30-min timer
- timer counts only during active hours (use shared time utilities)
- closing window during break ends session and resets timer
- overlay only in active/focused window; moves with active tab

Tests:
- Exhaustive unit tests for each event path and resulting actions/state.

Acceptance:
- No chrome wiring yet; engine is pure and covered.
```

### Prompt 09 — Wire background service worker to engine + Chrome APIs
```text
Goal:
Connect the pure engine to MV3 background entrypoint.

Requirements:
- On startup / installed / updated:
  - load settings + runtime state
  - compute nextReminderAt if missing or stale
  - schedule chrome.alarms for next reminder
  - schedule daily library fetch alarm (24h period)
- On chrome.alarms:
  - route to engine events (TICK_ALARM, REMINDER_AUTO_DISMISS, DAILY_FETCH)
- On tabs/windows events:
  - tabs.onActivated, tabs.onUpdated (for URL availability), tabs.onRemoved
  - windows.onFocusChanged, windows.onRemoved

Implementation:
- Create a small adapter layer:
  - `dispatch(event)` -> engine returns {state, actions}
  - persist state to storage
  - execute actions:
    - schedule alarms
    - message content script to show/hide overlay
- Add URL filtering: only http/https pages are “normal webpages”. Others should cause WAIT behavior.

Tests:
- Unit test the adapter with mocked chrome APIs (at least:
  - scheduling alarms called with expected timestamps
  - show/hide message sent to correct tab)

Acceptance:
- Background can now schedule a reminder (even if overlay UI still stubbed).
```

### Prompt 10 — Content script overlay shell (Shadow DOM) + message-driven rendering
```text
Goal:
Implement the content script overlay mount and minimal React UI routing.

Requirements:
- Content script matches `<all_urls>`
- Overlay mounts in a Shadow DOM UI container.
- Provide a minimal UI that can display:
  - Reminder mode: title + buttons (wired later)
  - Hidden mode: nothing rendered
- Implement message listener:
  - SHOW_REMINDER -> render reminder UI
  - HIDE_OVERLAY -> unmount/hide

Use WXT-recommended approach for Shadow-root UI mounting in content scripts.

Tests:
- Component test: render the overlay app in “REMINDER” mode and assert buttons exist.
- Unit test: message handler transitions local UI state.

Acceptance:
- Background can command overlay to appear/hide on a normal webpage.
```

### Prompt 11 — Popup shell: settings + status + Trigger break now (wired)
```text
Goal:
Build the toolbar popup UI (React) with:
- Status section:
  - Reminders On/Off
  - Within active hours (computed)
  - Next reminder countdown (live updating while popup open)
  - Show overlay button if a session is active
- Settings controls:
  - master toggle (persisted)
  - reminder interval
  - snooze minutes
  - stretch duration seconds
  - active hours start/end (no overnight)
  - disabled suggestion categories list
- Trigger break now button:
  - Sends TRIGGER_BREAK_NOW to background
  - Background resets timer (already in engine rules)

Implementation notes:
- Use shared storage wrapper to read/update settings.
- Use messaging to read a lightweight status snapshot from background (nextReminderAt, sessionActive, etc).

Tests:
- Popup renders status
- Countdown uses fake timers and updates text
- Changing a setting persists via storage wrapper

Acceptance:
- You can flip reminders on/off and trigger a reminder immediately via popup.
```

### Prompt 12 — Implement reminder overlay actions + auto-dismiss timer
```text
Goal:
Finish reminder overlay behavior end-to-end.

Overlay requirements (Reminder mode):
- Buttons: Start Break, Snooze, Dismiss, Skip today, Settings
- No stretch preview
- Auto-dismiss after 2 minutes of no action
- Snooze only once per reminder:
  - after snooze ends, reset 30-min timer
  - after snooze used, UI should not offer snooze again (or disables it)
- Dismiss resets timer (30 min)
- Skip today disables until next day active start
- Settings button instructs user to open popup (MVP uses popup; programmatic opening is limited—show a hint/toast is OK)

Implementation:
- UI sends messages to background:
  - REMINDER_SNOOZE / REMINDER_DISMISS / REMINDER_SKIP_TODAY / BREAK_START
- Background drives state and commands overlay to hide/show as needed.

Tests:
- Overlay component tests verifying:
  - snooze button disabled after snooze used
  - auto-dismiss triggers background message (simulate by fake timers)
- Add one integration-ish test for content/background message path with mocks.

Acceptance:
- Reminder overlay matches all reminder rules and resets timer correctly.
```

### Prompt 13 — Stretch selection UI (suggested set + show all)
```text
Goal:
Implement selection flow after Start Break.

Rules:
- Suggested: one stretch per category (excluding disabled suggestion categories)
- User cannot start break unless at least one stretch selected
- “Show all stretches”:
  - grouped by category, alphabetical, inline GIF thumbnails
  - user may select/override any category
  - user may leave categories unselected; unselected fall back to the current suggested stretch for that category
  - disabled categories still appear in “Show all”
  - selecting from a disabled category enables it for this session only

Implementation:
- Background provides the library to overlay on demand:
  - BREAK_START triggers ensureLibraryFresh
  - If ensureLibraryFresh fails -> SHOW_ERROR (Retry only)
  - If succeeds -> SHOW_SELECTION with stretches payload (or overlay requests it)
- Implement deterministic suggested selection:
  - For MVP, pick first alphabetical stretch per category (stable).
- Provide selection state and ordering:
  - user order = selection/edit order

Tests:
- Component tests for selection:
  - cannot proceed with zero selections
  - leaving a category unselected uses suggested fallback
  - show-all lists thumbnails and groups correctly

Acceptance:
- User can enter selection, view suggested set, optionally open show-all, and start runner with ≥1 stretch.
```

### Prompt 14 — Break runner UI (sequential timer + unselect behavior)
```text
Goal:
Implement the runner screen.

Rules:
- Runs stretches in the order user selected/edited
- Each stretch shows:
  - looping GIF
  - 1–2 sentence instructions
  - countdown timer (default 30s, configurable)
- Controls:
  - End break only
- No minimize
- Unselect behavior:
  - if user unselects a stretch during runner, finish current stretch then skip unselected going forward
- Completion:
  - congratulatory message then auto-close after 5 seconds

Implementation:
- Use fake timers for countdown in tests.
- For reliability across tab switches, keep runner state in background (single source of truth), and render based on UPDATE_SESSION_STATE messages.

Tests:
- Runner advances after 30s
- Unselect during runner applies after current stretch completes
- End break sends message and hides overlay
- Completion autoclose after 5s

Acceptance:
- Full guided runner works and closes cleanly.
```

### Prompt 15 — Tab/window movement rules implementation
```text
Goal:
Implement cross-tab/window behaviors exactly per spec.

Rules:
- Overlay shows only in currently active/focused window
- Switching tabs:
  - reminder overlay moves to newly active tab
  - runner moves to newly active tab
- Closing tab hosting overlay:
  - session continues in remaining active tab
- Closing window hosting overlay during running break:
  - session ends
  - timer resets
- If reminder triggers when no normal webpage is active:
  - do nothing and wait until a permitted/normal page becomes active

Implementation:
- Background listens to:
  - tabs.onActivated
  - tabs.onRemoved
  - windows.onFocusChanged
  - windows.onRemoved
- Use http/https URL checks for “normal webpage”.

Tests:
- Engine tests for TAB_CHANGED/TAB_CLOSED/WINDOW_CLOSED sequences
- Adapter tests verifying correct tab receives SHOW_* and previous receives HIDE

Acceptance:
- Moving and closure behaviors match spec reliably.
```

### Prompt 16 — Error UI (Retry only) + wiring for library fetch failures
```text
Goal:
Implement the error mode when stretch library fetch fails.

Rules:
- If library not reachable when user tries to Start Break:
  - block starting break
  - show generic error message
  - show Retry button only
- Retry triggers fetch again:
  - on success -> return to selection screen
  - on failure -> remain in error

Tests:
- Error view renders
- Retry triggers fetch and transitions appropriately (mock success/failure)

Acceptance:
- Error behavior matches spec and does not allow break to start without library.
```

### Prompt 17 — Accessibility and dark mode verification
```text
Goal:
Finalize a11y basics and dark mode.

Requirements:
- ARIA labels on interactive controls
- Screen-reader friendly headings and button labels
- Focus management:
  - when overlay opens, focus moves to the overlay container/title
  - focus remains usable even though page interaction is allowed (non-blocking)
- Dark mode based on system preference, consistent across popup and overlay

Tests:
- Assert aria-labels exist for key buttons
- Basic focus test: overlay open sets focus to expected element

Acceptance:
- Meets the MVP accessibility requirements.
```

### Prompt 18 — Smoke E2E test + production build check
```text
Goal:
Add an automated smoke test that loads the built extension in Chromium and verifies:
- Opening a normal webpage
- Opening the popup and clicking “Trigger break now”
- Seeing the in-page overlay appear

Implementation:
- Use Playwright to launch Chromium with the extension loaded.
- Keep it as a single smoke test initially.

Also add:
- A “release check” script that runs:
  - typecheck
  - unit tests
  - build
  - smoke test

Acceptance:
- One command can validate the extension end-to-end at a basic level.
```

---

## Notes for the code-generation LLM (applies to every prompt)
- Always start by writing/updating tests for the new behavior.
- Keep changes minimal and integrated; do not leave unused modules.
- Prefer pure functions and state machines for logic; keep Chrome API usage in thin adapters.
- Ensure each step ends with the extension still building and tests passing.

If you want fewer prompts, merge Prompts 16–18 into one “Polish & QA” step.
