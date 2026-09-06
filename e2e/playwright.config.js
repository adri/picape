const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  outputDir: '../tmp/e2e',
  // Each project keeps its own baselines: the same screen looks different with
  // and without safe-area insets, and that difference is the whole point.
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: [['list']],
  expect: { toHaveScreenshot: { maxDiffPixels: 100, threshold: 0.1 } },
  use: {
    baseURL: 'http://localhost:19006',
    navigationTimeout: 90_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      // A browser tab, where every safe-area inset reads 0.
      name: 'iphone',
      use: {
        ...devices['iPhone 14'],
        ...(process.env.E2E_BROWSER ? { browserName: process.env.E2E_BROWSER } : {}),
      },
    },
    {
      // The app installed to the home screen, where iOS hands the page the
      // notch and the home indicator to work around. No browser emulates that,
      // so the spec injects the insets that react-native-safe-area-context's
      // hidden probe reads, and asserts they took before capturing anything.
      //
      // It earns its own project because a bar that looks right in a tab can be
      // wrong in standalone: a tab's toolbar covers the strip above the home
      // indicator, which is exactly where that class of bug lives.
      name: 'iphone-standalone',
      use: {
        ...devices['iPhone 14'],
        ...(process.env.E2E_BROWSER ? { browserName: process.env.E2E_BROWSER } : {}),
      },
    },
    {
      // An iPad Pro 13" in portrait, which is 1024x1366 points. Playwright ships
      // no descriptor that wide, so the 11" one supplies the user agent and the
      // touch flags and the viewport is set here.
      //
      // It earns its own project because every rule that only binds above the
      // content width is invisible to a phone baseline: a column that stopped
      // being capped, or a grid that went back to two columns, still passes
      // every iPhone screenshot.
      name: 'ipad',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 1024, height: 1366 },
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
