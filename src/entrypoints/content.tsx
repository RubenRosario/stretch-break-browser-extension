import { createRoot } from 'react-dom/client';

import { OverlayPlaceholder } from '@/entrypoints/content/overlay-placeholder';
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
    document.body.appendChild(container);

    createRoot(container).render(<OverlayPlaceholder />);
  }
});
