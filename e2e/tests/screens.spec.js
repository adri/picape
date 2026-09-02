const { test, expect } = require('@playwright/test');

const tabs = [
  ['plan', /Recepten/],
  ['search', /Zoeken/],
  ['basics', /Basics/],
  ['shop', /Mandje/],
];

const skipScreenshots = process.env.E2E_SKIP_SCREENSHOTS === '1';

function watch(page) {
  const problems = [];
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('websocket', (ws) =>
    ws.on('framereceived', (frame) => {
      if (String(frame.payload).includes('"errors":[')) problems.push(`graphql: ${frame.payload}`);
    })
  );
  return problems;
}

async function openApp(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(
    page
      .getByRole('button', { name: /Mandje/ })
      .getByText('4')
      .first()
  ).toBeVisible({ timeout: 60_000 });
}

async function checkScreen(page, name) {
  if (skipScreenshots) {
    await page.screenshot({ path: `../tmp/e2e/${name}.png` });
  } else {
    await expect(page).toHaveScreenshot(`${name}.png`);
  }
}

test.beforeEach(async ({ page, request }) => {
  await request.post('http://localhost:4020/__reset');
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
});

for (const [name, label] of tabs) {
  test(`${name} tab renders`, async ({ page }) => {
    const problems = watch(page);
    await openApp(page);
    await page.getByRole('button', { name: label }).click();
    await page.waitForLoadState('networkidle');
    await checkScreen(page, name);
    expect(problems).toEqual([]);
  });
}

test('tapping a recipe opens its detail screen', async ({ page }) => {
  const problems = watch(page);
  await openApp(page);
  await page.getByText('Nasi', { exact: true }).first().click();
  await expect(page.getByText('Chinese Wokmix').first()).toBeVisible();
  await page.waitForLoadState('networkidle');
  await checkScreen(page, 'recipe-detail');
  expect(problems).toEqual([]);
});
