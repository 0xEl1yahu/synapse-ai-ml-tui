import { existsSync } from 'node:fs';
import { chromium, defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4178';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL,
    channel: existsSync(chromium.executablePath()) ? 'chromium' : 'chrome',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4178 --strictPort',
    url: baseURL,
    timeout: 120_000,
  },
});
