# Stretch Break — MVP Developer Specification

## 1. Overview

Stretch Break is a Chromium-based browser extension (Manifest V3) that reminds users to take breaks every 30 minutes and guides them through short stretching exercises using looping GIFs.

The extension:
- Runs on all websites (`<all_urls>`)
- Injects an in-page overlay into the active tab
- Uses WXT + React + TypeScript
- Uses Tailwind CSS + shadcn/ui
- Mounts overlay inside a Shadow DOM for style isolation
- Fetches stretch content from a fixed remote CDN (no authentication)
- Stores all settings locally
- Collects no analytics

---

# 2. Technical Stack & Architecture

## 2.1 Stack

- Framework: **WXT**
- Language: **TypeScript**
- UI: **React**
- Styling: **Tailwind CSS + shadcn/ui**
- shadcn/ui setup: **Install components via shadcn CLI (`pnpm dlx shadcn@latest add ...`)**
- shadcn/ui setup constraint: **Manual component setup is not allowed**
- Overlay isolation: **Shadow DOM**
- Manifest: **MV3**
- Storage: `chrome.storage.local`
- Scheduling: `chrome.alarms`
- Injection: `chrome.scripting`

## 2.2 Architecture

### Background (Service Worker)
Handles:
- Reminder timer logic
- Active hours enforcement
- Snooze logic
- Skip today logic
- Master toggle
- Overlay injection and relocation
- Tab/window tracking
- Remote library fetch coordination

### Content Script
Handles:
- Mounting overlay in Shadow DOM
- Rendering React UI
- Reminder UI
- Stretch selection
- Break runner
- Completion screen
- Error state
- Messaging with background

### Toolbar Popup
Handles:
- Settings UI
- Status display
- Manual trigger
- Show overlay button

---

# 3. Reminder System

## 3.1 Reminder Interval

- Default: **30 minutes**
- Configurable in settings
- Timer:
  - Runs only during active hours
  - Runs continuously (not idle-based)
  - Continues while browser is open
  - Continues even if window is minimized

## 3.2 Active Hours

- Default: **09:00–18:00 (local time)**
- Applies every day
- No overnight ranges allowed
- Configurable start and end time

### End-of-Day Behavior

- If reminder triggers after active hours: do not show.
- When active hours resume next day: reset and start fresh.
- If countdown completes during active hours: show reminder normally.

---

# 4. Reminder Overlay

## 4.1 Display Rules

- Injected on supported webpages only
- Positioned top-right
- Non-draggable
- Self-contained styling
- Dark mode supported (system preference)
- Only shown in active/focused window

## 4.2 Auto-Dismiss

- If no interaction: auto-dismiss after **2 minutes**
- Restart 30-minute timer

## 4.3 Actions

- Start Break
- Snooze (only once)
- Dismiss
- Skip Today
- Settings

---

# 5. Snooze Logic

- Default: 5 minutes
- Configurable
- Allowed once per reminder
- After snooze ends: reset full 30-minute timer

---

# 6. Dismiss Logic

- Reset 30-minute timer immediately

---

# 7. Skip Today

- Disable reminders until next day’s active start
- Hidden when master toggle is OFF

---

# 8. Break Flow

1. Reminder appears (no stretch preview)
2. Start Break clicked
3. Stretch selection screen
4. User selects ≥ 1 stretch
5. Runner starts
6. Completion message
7. Auto-close after 5 seconds

---

# 9. Stretch Selection

## 9.1 Categories

- Neck
- Shoulders
- Wrists
- Back
- Legs
- Feet
- Eyes

## 9.2 Suggested Set

- One stretch per category

## 9.3 Show All Stretches

- Grouped by category
- Alphabetically sorted
- GIF thumbnails inline
- User may leave categories unselected
- Must select at least one overall
- Unselected categories fall back to suggested stretch

## 9.4 Category Settings Interaction

- Disabling category affects suggestions only
- Still visible in Show All
- If selected → enabled for that session only

---

# 10. Break Runner

- Runs stretches in selected order
- Default 30 seconds per stretch (configurable)
- GIF loops continuously
- Only control: End Break
- No pause/minimize
- If stretch unselected during run:
  - Finish current stretch
  - Skip unselected thereafter

## Completion

- Show congratulatory message
- Auto-close after 5 seconds

---

# 11. Tab & Window Behavior

- Overlay moves when switching tabs
- Runner moves when switching tabs
- Closing tab → continue in remaining tab
- Closing window → end break and reset timer
- Only active window displays overlay

---

# 12. Settings (Toolbar Popup)

## 12.1 Configurable

- Master toggle (persisted)
- Reminder interval
- Snooze duration
- Stretch duration
- Active hours
- Enable/disable category suggestions

## 12.2 Manual Trigger

- “Trigger break now”
- Resets timer
- Works even if reminders disabled

## 12.3 Status Section

Displays:
- Reminders On/Off
- Within active hours
- Live countdown
- Show overlay button if active

---

# 13. Remote Stretch Library

## 13.1 Hosting

- Cloudflare R2 + CDN
- Fixed hardcoded base URL
- No authentication

Example:
https://cdn.yourdomain.com/stretch-break/library.json
https://cdn.yourdomain.com/stretch-break/gifs/<id>.gif

## 13.2 JSON Schema

```json
{
  "stretches": [
    {
      "id": "neck-tilt",
      "name": "Neck Tilt",
      "category": "neck",
      "gifUrl": "https://cdn.../neck-tilt.gif",
      "instructions": "Gently tilt your head toward your shoulder..."
    }
  ]
}
```

### 13.3 Content Constraints

- Language: English only (MVP)
- No JSON schema versioning required for MVP

## 14. Remote Fetch Strategy

### Fetch Triggers

The stretch library must be fetched:

- On extension install
- On extension update
- Once per day
- Before starting a break if the library is not already loaded

### Failure Handling

If the fetch fails:

- Block starting the break
- Show a generic error message
- Display a **Retry** button only

There is **no offline fallback** in MVP.

---

## 15. Storage

All data is stored in `chrome.storage.local`.

### Stored Data

- Settings
- Snooze state
- Skip today timestamp
- Active timer state
- Overlay active state
- Last successful fetch timestamp

No analytics are collected.
No user activity history is stored.

---

## 16. Permissions

The Manifest must include:

- `<all_urls>`
- `storage`
- `alarms`
- `scripting`
- `activeTab`

---

## 17. Accessibility

The extension must include:

- Proper ARIA labels
- Screen-reader-friendly text
- Proper focus management for overlays
