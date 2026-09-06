const { test, expect } = require('@playwright/test');

// Invariants a screenshot cannot express.
//
// A baseline says "this screen looks like this today". It says nothing about
// what must stay true when the data changes, and it happily locks in a bug the
// day it is accepted. Every check here is a rule that broke in practice:
//
//   - a row jumped when a count appeared beside its heading
//   - a strip clipped its own labels because it was given a fixed height
//   - two controls that sit in the same place rendered at different insets
//
// None of them showed up in a screenshot, because each needs either an
// interaction or a comparison between two states.

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
  await page
    .getByText(/Using Fast Refresh|Don't see your changes\? Reload the app/)
    .waitFor({ state: 'hidden', timeout: 15_000 })
    .catch(() => {});
}

function tab(page, label) {
  return page.getByLabel(label);
}

async function openApp(page) {
  await page.goto('/');
  await settle(page);
  await expect(tab(page, /Mandje/).getByText('4').first()).toBeVisible({ timeout: 60_000 });
}

// The box of the element that actually paints the text, not the row around it.
function boxOf(locator) {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height };
  });
}

test.beforeEach(async ({ page, request }) => {
  await request.post('http://localhost:4020/__reset');
  // Planned recipes are database rows, so a test that plans one would
  // otherwise leave it planned for everything after it.
  await request.post('http://localhost:4010/dev/reset-plan');
  await request.post('http://localhost:4010/dev/invalidate-cart');
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
});

test('planning a recipe does not move the page', async ({ page }) => {
  await openApp(page);

  // A shelf heading gains a count once something under it is planned, so the
  // heading has to already be tall enough for that count. Otherwise planning
  // one recipe shoves everything below it down by the difference.
  //
  // Planned state lives in the database and survives the run, so this toggles
  // whichever way the card happens to be sitting rather than assuming it starts
  // unplanned. The invariant holds in both directions.
  const plan = page.getByRole('button', { name: 'Toevoegen' }).first();
  const unplan = page.getByRole('button', { name: 'Gedaan' }).first();
  const planned = await plan.count().then((n) => n === 0);
  const control = planned ? unplan : plan;
  const opposite = planned ? plan : unplan;

  const heading = page.getByText('Met rijst', { exact: true }).first();
  const before = await boxOf(heading);

  await control.click();
  await expect(opposite.first()).toBeVisible();

  const after = await boxOf(heading);
  expect(after.height, 'heading changed height when the count appeared').toBe(before.height);
  expect(after.top, 'heading moved when the count appeared').toBe(before.top);

});

test('the cart heading is as tall without a saving as with one', async ({ page }) => {
  await openApp(page);
  await tab(page, /Mandje/).click();
  await settle(page);

  // "Je mandje" carries the order total, and under it the bonus when the order
  // saved anything. Both arrive after the first paint and the bonus is there
  // only some weeks, so a heading sized to whatever happens to be in it grows
  // the moment a saving turns up and shoves the whole basket down.
  //
  // The fake basket always has a bonus on it, so the only way to see the
  // heading without one is to take the line out of the page and measure again.
  const savings = page.getByText(/bespaard/).first();
  await expect(savings).toBeVisible();

  const heading = page.getByRole('heading', { name: 'Je mandje' }).first();
  const before = await boxOf(heading.locator('xpath=..'));

  await savings.evaluate((el) => {
    el.style.display = 'none';
  });

  const after = await boxOf(heading.locator('xpath=..'));
  expect(after.height, 'the heading shrinks when nothing is saved').toBe(before.height);
});

test('a recipe strip shows its labels in full', async ({ page }) => {
  await openApp(page);

  // "Dit heb je in huis" is a horizontal strip of recipe cards, the same shape
  // the cart uses for planned recipes. That one carried a hard-coded height and
  // sliced its labels in half. Nothing about it is visible to a screenshot
  // baseline, which happily records the cropped version as correct.
  const label = page.getByText('Shoarma', { exact: true }).first();
  await expect(label).toBeVisible();

  // Playwright calls a clipped element visible, so measure the label against
  // whatever crops it.
  const cropped = await label.evaluate((el) => {
    const box = el.getBoundingClientRect();
    for (let node = el.parentElement; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.overflow !== 'visible' && style.overflowY !== 'visible') {
        const clip = node.getBoundingClientRect();
        if (clip.height > 0 && box.bottom > clip.bottom + 1) {
          return { by: Math.round(box.bottom - clip.bottom) };
        }
      }
    }
    return null;
  });

  expect(cropped, 'the strip crops its own label').toBeNull();
});

test('the cart keeps its recipes off its ingredients', async ({ page }) => {
  await openApp(page);

  // The strip of planned recipes only exists once something is planned, and the
  // seeded cart has nothing planned, so no screenshot of it has ever contained
  // the strip. The gap under it went to zero and the last card's label ran
  // straight into the first ingredient row.
  await page.getByRole('button', { name: 'Toevoegen' }).first().click();
  await expect(page.getByRole('button', { name: 'Gedaan' }).first()).toBeVisible();

  await tab(page, /Mandje/).click();
  await settle(page);
  await expect(page.getByText('Chicken', { exact: true }).first()).toBeVisible();

  const gap = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('div')).filter((el) => {
      const style = getComputedStyle(el);
      return (
        style.borderRadius !== '0px' &&
        style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
        el.children.length === 3 &&
        el.getBoundingClientRect().width > 200
      );
    });
    if (rows.length === 0) return null;
    const firstRow = rows[0].getBoundingClientRect().top;

    // The strip scrolls sideways, so it is the widest thing above the first row
    // that clips on its x axis. The outer page scroller sits below it.
    const strip = Array.from(document.querySelectorAll('div'))
      .filter((el) => getComputedStyle(el).overflowX !== 'visible')
      .map((el) => el.getBoundingClientRect())
      .filter((box) => box.width > 200 && box.bottom <= firstRow + 1)
      .sort((a, b) => b.bottom - a.bottom)[0];
    if (!strip) return null;

    return Math.round(firstRow - strip.bottom);
  });

  expect(gap, 'found no recipe strip above the ingredients').not.toBeNull();
  // One step below what the screen sets, so a deliberate change to the next
  // size down still passes and a collapse back to nothing does not.
  expect(gap, 'the recipe strip runs into the first ingredient row').toBeGreaterThanOrEqual(16);
});

test('every ingredient row puts its control in the same place', async ({ page }) => {
  await openApp(page);
  await tab(page, /Basics/).click();
  await settle(page);
  await expect(page.getByText('Butter', { exact: true }).first()).toBeVisible();

  // A row shows a plus when nothing is ordered and a count once something is,
  // and the two used to sit at different distances from the edge because one of
  // them carried a margin of its own.
  const insets = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('div')).filter((el) => {
      const style = getComputedStyle(el);
      return (
        style.borderRadius !== '0px' &&
        style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
        el.children.length === 3 &&
        el.getBoundingClientRect().width > 200
      );
    });
    return rows.slice(0, 12).map((row) => {
      const r = row.getBoundingClientRect();
      const last = row.children[row.children.length - 1];
      return Math.round(r.right - last.getBoundingClientRect().right);
    });
  });

  expect(insets.length, 'found no ingredient rows to compare').toBeGreaterThan(1);
  expect(new Set(insets).size, `trailing insets differ: ${insets.join(', ')}`).toBe(1);
});
