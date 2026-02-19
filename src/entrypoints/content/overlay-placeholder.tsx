import { StretchBreakCard } from '@/components/shared/stretch-break-card';

/**
 * Props for the overlay placeholder UI.
 */
export interface OverlayPlaceholderProps {
  /** Render mode label for diagnostics while wiring the overlay state machine. */
  mode?: 'stub';
}

/**
 * Minimal overlay placeholder rendered by the content script.
 */
export function OverlayPlaceholder({ mode = 'stub' }: OverlayPlaceholderProps) {
  return (
    <section
      aria-label="Stretch Break overlay"
      className="fixed right-4 top-4 z-[2147483647] w-[22rem]"
      data-overlay-mode={mode}
    >
      <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Overlay {mode} mode</p>
      <StretchBreakCard />
    </section>
  );
}
