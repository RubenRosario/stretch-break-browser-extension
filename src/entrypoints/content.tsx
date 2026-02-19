import { createRoot } from 'react-dom/client';

import { StretchBreakCard } from '@/components/shared/stretch-break-card';
import '@/styles/globals.css';

/**
 * Content script entrypoint.
 */
export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Placeholder overlay container for future message-driven reminder UI.
    const container = document.createElement('div');
    container.id = 'stretch-break-overlay';
    container.className = 'fixed right-4 top-4 z-[2147483647]';
    document.body.appendChild(container);

    createRoot(container).render(<StretchBreakCard />);
  }
});
