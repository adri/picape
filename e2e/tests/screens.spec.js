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

// webpack-dev-server keeps an HMR channel open, so the network never goes quiet
// for the 500ms `networkidle` wants and the wait burns its whole timeout on CI.
// Settling is best effort; the assertions after each call are the real signal.
async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
}

function tab(page, label) {
  return page.getByLabel(label);
}

function cartBadge(page, count) {
  return tab(page, /Mandje/).getByText(String(count)).first();
}

async function openApp(page) {
  await page.goto('/');
  await settle(page);
  await expect(cartBadge(page, 4)).toBeVisible({ timeout: 60_000 });
}

async function checkScreen(page, name) {
  if (skipScreenshots) {
    await page.screenshot({ path: `../tmp/e2e/${name}.png`, scale: 'css' });
  } else {
    await expect(page).toHaveScreenshot(`${name}.png`);
  }
}

test.beforeEach(async ({ page, request }) => {
  await request.post('http://localhost:4020/__reset');
  await request.post('http://localhost:4010/dev/invalidate-cart');
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
});

for (const [name, label] of tabs) {
  test(`${name} tab renders`, async ({ page }) => {
    const problems = watch(page);
    await openApp(page);
    await tab(page, label).click();
    await settle(page);
    await checkScreen(page, name);
    expect(problems).toEqual([]);
  });
}

test('tapping a recipe opens its detail screen', async ({ page }) => {
  const problems = watch(page);
  await openApp(page);
  await page.getByText('Nasi', { exact: true }).first().click();
  await expect(page.getByText('Chinese Wokmix').first()).toBeVisible();
  await settle(page);
  await checkScreen(page, 'recipe-detail');
  expect(problems).toEqual([]);
});

test('raising a quantity in the cart syncs with the supermarket', async ({ page }) => {
  const problems = watch(page);
  await openApp(page);
  await tab(page, /Mandje/).click();
  const butter = page
    .getByText('Butter', { exact: true })
    .locator('xpath=ancestor::div[.//div[text()="1"]][1]');
  await butter.getByText('1', { exact: true }).click();
  await butter.locator('div[tabindex="0"]').last().click();
  await expect(cartBadge(page, 5)).toBeVisible();
  await expect(page.getByText('2', { exact: true })).toHaveCount(2);
  expect(problems).toEqual([]);
});
