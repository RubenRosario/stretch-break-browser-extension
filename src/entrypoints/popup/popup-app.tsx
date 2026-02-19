import { StretchBreakCard } from '@/components/shared/stretch-break-card';

/**
 * Popup root component.
 */
export function PopupApp() {
  return (
    <main className="flex min-h-[220px] min-w-[340px] items-center justify-center bg-background p-4">
      <StretchBreakCard />
    </main>
  );
}
