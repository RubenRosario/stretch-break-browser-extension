import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/styles/globals.css';

import { PopupApp } from './popup-app';

const mountNode = document.getElementById('root');

if (!mountNode) {
  throw new Error('Popup mount node was not found.');
}

createRoot(mountNode).render(
  <StrictMode>
    <PopupApp />
  </StrictMode>
);
