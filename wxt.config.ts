import { defineConfig } from 'wxt';

/**
 * WXT configuration for the Stretch Break Chromium extension.
 */
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'Stretch Break',
    description: 'A browser extension that reminds you to take stretch breaks.',
    permissions: ['storage', 'alarms', 'scripting', 'activeTab'],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'Stretch Break'
    }
  }
});
