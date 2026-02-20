import { useEffect, useState } from 'react';

import { StretchBreakCard } from '@/components/shared/stretch-break-card';
import { DEFAULT_SETTINGS, getSettings, type Settings } from '@/shared';

/**
 * Popup root component.
 */
export function PopupApp() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let mounted = true;

    void getSettings().then((nextSettings) => {
      if (mounted) {
        setSettings(nextSettings);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="flex min-h-[220px] min-w-[340px] items-center justify-center bg-background p-4">
      <StretchBreakCard settings={settings} />
    </main>
  );
}
