/**
 * Commands sent from popup/content contexts to the background service worker.
 */
export type BackgroundCommand =
  | { type: 'TRIGGER_BREAK_NOW' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'REMINDER_SNOOZE' }
  | { type: 'REMINDER_DISMISS' }
  | { type: 'REMINDER_SKIP_TODAY' }
  | { type: 'BREAK_START' }
  | { type: 'BREAK_END' }
  | { type: 'LIBRARY_RETRY_FETCH' }
  | { type: 'OVERLAY_SHOW_REQUEST' }
  | { type: 'OVERLAY_HIDE_REQUEST' };

/**
 * UI session mode names for content overlay rendering.
 */
export type OverlaySessionMode = 'REMINDER' | 'SELECTION' | 'RUNNER' | 'ERROR' | 'IDLE';

/**
 * Session update payload sent from background to content.
 */
export interface SessionStateUpdate {
  /** Current overlay session mode. */
  mode: OverlaySessionMode;
  /** Timestamp for when this state was produced. */
  updatedAt: number;
}

/**
 * Messages sent from background to content for UI transitions.
 */
export type ContentMessage =
  | { type: 'SHOW_REMINDER' }
  | { type: 'SHOW_SELECTION' }
  | { type: 'SHOW_RUNNER' }
  | { type: 'SHOW_ERROR' }
  | { type: 'HIDE_OVERLAY' }
  | { type: 'UPDATE_SESSION_STATE'; payload: SessionStateUpdate };
