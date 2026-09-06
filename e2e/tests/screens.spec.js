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

// The Expo dev server keeps an HMR channel open, so the network never goes
// quiet for the 500ms `networkidle` wants and the wait burns its whole timeout
// on CI. Settling is best effort; the assertions after it are the real signal.
async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
  // Expo's dev server drops a "Refreshing..." banner over the tab bar and takes
  // ~1.3s to animate it away, so it lands in screenshots. It is dev-only chrome
  // that never ships, so wait for it to go rather than capture it.
  await page
    .getByText(/Using Fast Refresh|Don't see your changes\? Reload the app/)
    .waitFor({ state: 'hidden', timeout: 15_000 })
    .catch(() => {});
}

function tab(page, label) {
  return page.getByLabel(label);
}

function cartBadge(page, count) {
  return tab(page, /Mandje/).getByText(String(count)).first();
}

async function openApp(page, testInfo) {
  await page.goto('/');
  await settle(page);
  await expect(cartBadge(page, 6)).toBeVisible({ timeout: 60_000 });
  if (testInfo && testInfo.project.name === 'iphone-standalone') {
    await expectInsetsApplied(page, STANDALONE_INSETS);
  }
}

async function checkScreen(page, name) {
  if (skipScreenshots) {
    await page.screenshot({ path: `../tmp/e2e/${name}.png`, scale: 'css' });
  } else {
    await expect(page).toHaveScreenshot(`${name}.png`);
  }
}

// What an iPhone with a notch and a home indicator reports in portrait, which
// is what the app sees once it is installed to the home screen.
const STANDALONE_INSETS = { top: 59, bottom: 34 };

// react-native-safe-area-context reads the insets on web by putting a hidden
// div in the body whose padding is env(safe-area-inset-*) and measuring it. A
// browser resolves those to 0, so that one element gets the values instead.
//
// It is done by watching for the element rather than by installing a
// stylesheet up front: an init script runs before the document has anywhere to
// append one, and a stylesheet added later can lose the race with React's
// effect. Setting the padding on the element itself always lands, and because
// the library gave it `transition: padding`, the change fires the transitionend
// it already listens for, so it re-measures and the app picks the insets up.
async function emulateStandalone(page, { top, bottom }) {
  await page.addInitScript(
    ([t, b]) => {
      const isProbe = (node) =>
        node.nodeType === 1 && node.style && node.style.transitionProperty === 'padding';

      const apply = (el) => {
        el.style.setProperty('padding-top', `${t}px`, 'important');
        el.style.setProperty('padding-bottom', `${b}px`, 'important');
        el.style.setProperty('padding-left', '0px', 'important');
        el.style.setProperty('padding-right', '0px', 'important');
      };

      const start = () => {
        Array.from(document.body.children).forEach((el) => isProbe(el) && apply(el));
        new MutationObserver((records) => {
          records.forEach((record) =>
            record.addedNodes.forEach((node) => isProbe(node) && apply(node))
          );
        }).observe(document.body, { childList: true });
      };

      if (document.body) start();
      else document.addEventListener('DOMContentLoaded', start, { once: true });
    },
    [top, bottom]
  );
}

// An emulation that silently does nothing is worse than none: it produces
// confident screenshots of the wrong thing. Check the app actually consumed the
// insets before any assertion depends on them.
async function expectInsetsApplied(page, { top, bottom }) {
  const measured = await page.evaluate(() => {
    const probe = Array.from(document.body.children).find(
      (el) => el.style && el.style.transitionProperty === 'padding'
    );
    if (!probe) return null;
    const style = getComputedStyle(probe);
    return { top: style.paddingTop, bottom: style.paddingBottom };
  });
  expect(measured, 'safe-area probe element not found').not.toBeNull();
  expect(measured).toEqual({ top: `${top}px`, bottom: `${bottom}px` });

  // And that the app read them, rather than just the stylesheet landing: the
  // plan screen's SafeAreaView pushes its title below the notch.
  const titleTop = await page
    .getByText('Recepten', { exact: true })
    .first()
    .evaluate((el) => el.getBoundingClientRect().top);
  expect(titleTop, 'app did not apply the top inset').toBeGreaterThanOrEqual(top);
}

test.beforeEach(async ({ page, request }, testInfo) => {
  await request.post('http://localhost:4020/__reset');
  // Planned recipes are database rows, so a test that plans one would
  // otherwise leave it planned for everything after it.
  await request.post('http://localhost:4010/dev/reset-plan');
  await request.post('http://localhost:4010/dev/invalidate-cart');
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
  if (testInfo.project.name === 'iphone-standalone') {
    await emulateStandalone(page, STANDALONE_INSETS);
  }
});

for (const [name, label] of tabs) {
  test(`${name} tab renders`, async ({ page }, testInfo) => {
    const problems = watch(page);
    await openApp(page, testInfo);
    await tab(page, label).click();
    await settle(page);
    await checkScreen(page, name);
    expect(problems).toEqual([]);
  });
}

test('tapping a recipe opens its detail screen', async ({ page }, testInfo) => {
  const problems = watch(page);
  await openApp(page, testInfo);
  await page.getByText('Nasi', { exact: true }).first().click();
  await expect(page.getByText('Chinese Wokmix').first()).toBeVisible();
  await settle(page);
  await checkScreen(page, 'recipe-detail');
  expect(problems).toEqual([]);
});

test('tapping an ingredient opens its detail screen', async ({ page }, testInfo) => {
  const problems = watch(page);
  await openApp(page, testInfo);
  await tab(page, /Basics/).click();
  await settle(page);
  await page.getByRole('button', { name: 'Chicken', exact: true }).click();
  // The recorded product card, so the screen has the supermarket's answer and
  // not just the ingredient's own name.
  await expect(page.getByText('AH Biologisch Kipfilet 2 stuks')).toBeVisible();
  await settle(page);
  await checkScreen(page, 'ingredient-detail');
  expect(problems).toEqual([]);
});

test('the home screen opens what was bought before', async ({ page }, testInfo) => {
  const problems = watch(page);
  await openApp(page, testInfo);
  // By role: the screen it opens carries the same words as its own heading, and
  // detachPreviousScreen keeps this link in the DOM behind that screen.
  await page.getByRole('link', { name: 'Eerder gekocht' }).click();
  // A seeded ingredient that is on no earlier order but this one, so the
  // assertion cannot pass on whatever is left mounted underneath.
  await expect(page.getByText('Kidney beans', { exact: true })).toHaveCount(1);
  await settle(page);
  await checkScreen(page, 'previously-ordered');
  expect(problems).toEqual([]);
});

test('the cart shows the booked delivery slot', async ({ page }, testInfo) => {
  const problems = watch(page);
  await openApp(page, testInfo);
  await tab(page, /Mandje/).click();
  // The whole line, and only the cart has it: detachPreviousScreen keeps the
  // home screen mounted underneath, so a shorter locator could match twice.
  await expect(page.getByText('wo 9 sep', { exact: true })).toHaveCount(1);
  expect(problems).toEqual([]);
});

test('raising a quantity in the cart syncs with the supermarket', async ({ page }, testInfo) => {
  const problems = watch(page);
  await openApp(page, testInfo);
  await tab(page, /Mandje/).click();
  // Found by its picture, not its label: the label now carries a nutriscore
  // badge inside the same line, so nothing on the row reads as exactly "Butter".
  const butter = page
    .getByRole('button', { name: 'Butter', exact: true })
    .locator('xpath=ancestor::div[.//div[text()="1"]][1]');
  await butter.getByText('1', { exact: true }).click();
  // The icon buttons carry a role and a label now, so select the control by
  // what it is rather than by the div react-native-web happens to render.
  await butter.getByRole('button', { name: 'Toevoegen' }).click();
  await expect(cartBadge(page, 7)).toBeVisible();
  await expect(page.getByText('2', { exact: true })).toHaveCount(2);
  expect(problems).toEqual([]);
});
