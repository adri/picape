const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  outputDir: '../tmp/e2e',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: [['list']],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  use: {
    baseURL: 'http://localhost:19006',
    navigationTimeout: 90_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'iphone',
      use: {
        ...devices['iPhone 14'],
        ...(process.env.E2E_BROWSER ? { browserName: process.env.E2E_BROWSER } : {}),
      },
    },
  ],
  webServer: [
    {
      command: '../bin/supermarket-fake',
      url: 'http://localhost:4020/mobile-services/product/search/v2',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'mkdir -p ../tmp && ../bin/phx --fake > ../tmp/phx-e2e.log 2>&1',
      url: 'http://localhost:4010/graphql',
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: 'npm run web --prefix ../frontend > ../tmp/expo-e2e.log 2>&1',
      url: 'http://localhost:19006/',
      reuseExistingServer: true,
      timeout: 240_000,
    },
  ],
});
