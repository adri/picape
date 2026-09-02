// Used by bin/web-probe. Prints what a page does in WebKit on an iPhone profile.
const path = require('path');
const { webkit, devices } = require('@playwright/test');

const url = process.argv[2] || 'http://localhost:19006/';
const screenshot = path.join(__dirname, '..', 'tmp', 'probe.png');

(async () => {
  const browser = await webkit.launch();
  const page = await (await browser.newContext({ ...devices['iPhone 14'] })).newPage();
  const lines = [];
  page.on('console', (m) => {
    if (m.type() === 'error') lines.push(`console.error ${m.text().slice(0, 300)}`);
  });
  page.on('pageerror', (e) => lines.push(`pageerror ${e.message.slice(0, 300)}`));
  page.on('requestfailed', (r) => {
    if (r.url().startsWith('http://localhost')) {
      lines.push(`requestfailed ${r.url().slice(0, 120)} ${r.failure()?.errorText}`);
    }
  });
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
  try {
    await page.goto(url, { timeout: 60_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 });
  } catch (error) {
    lines.push(`navigation ${error.message.split('\n')[0]}`);
  }
  await page.waitForTimeout(3000);
  const root = await page
    .locator('#root')
    .innerHTML({ timeout: 1000 })
    .catch(() => '');
  await page.screenshot({ path: screenshot });
  console.log(
    `${url} root html ${root.length} chars, screenshot ${path.relative(process.cwd(), screenshot)}`
  );
  for (const line of lines) console.log(line);
  await browser.close();
  process.exit(lines.some((l) => l.startsWith('pageerror') || l.startsWith('navigation')) ? 1 : 0);
})();
