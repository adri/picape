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
  await expect(tab(page, /Mandje/).getByText('6').first()).toBeVisible({ timeout: 60_000 });
}

// The box of the element that actually paints the text, not the row around it.
function boxOf(locator) {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height };
  });
}

// The scroller of the screen you are looking at. A tab screen scrolls inside
// its own box rather than the document, and detachPreviousScreen keeps every
// screen you have already opened in the page, so the one that counts is the box
// that both overflows and is still painted.
async function scroller(page) {
  const handle = await page.evaluateHandle(() =>
    Array.from(document.querySelectorAll('div')).find((el) => {
      const style = getComputedStyle(el);
      return (
        (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        el.scrollHeight > el.clientHeight + 1 &&
        el.getBoundingClientRect().height > 0
      );
    })
  );

  expect(handle.asElement(), 'this screen has nothing to scroll').not.toBeNull();

  return {
    offset: () => handle.evaluate((el) => Math.round(el.scrollTop)),
    // Assigned rather than scrolled with `scrollTo`, which the box smooths and
    // therefore does not finish before the next line reads it back.
    scrollTo: (top) => handle.evaluate((el, y) => (el.scrollTop = y), top),
  };
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
  // By its picture, not its label: the label now carries a nutriscore badge
  // inside the same line, so nothing on the row reads as exactly "Chicken".
  await expect(page.getByRole('button', { name: 'Chicken', exact: true })).toBeVisible();

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

test('ordering from the bought-before list leaves the row where it was', async ({ page }) => {
  await openApp(page);
  await page.getByRole('link', { name: 'Eerder gekocht' }).click();

  // The list is everything bought on an earlier order, and it deliberately
  // keeps showing what is already on the list rather than dropping it: the row
  // carries its own count, so it reads as added. Filter the ordered ones out
  // and a row vanishes under the finger that tapped it and everything below
  // jumps up a line, which no baseline can show.
  const tile = page.getByRole('button', { name: 'Kidney beans', exact: true });
  await expect(tile).toBeVisible();
  const row = tile.locator('xpath=..');
  const before = await boxOf(tile);

  await row.getByLabel('Toevoegen').click();
  await expect(row.getByText('1', { exact: true })).toBeVisible();

  const after = await boxOf(tile);
  expect(after.top, 'the row moved when it was ordered').toBe(before.top);

  // Put it back. An ordered ingredient is a row in the database, so without
  // this the rest of the suite runs against a cart this test filled.
  await row.getByText('1', { exact: true }).click();
  await row.getByLabel('Verwijderen').click();
  await expect(row.getByLabel('Toevoegen')).toBeVisible();
});

async function openChickenDetail(page) {
  await openApp(page);
  await tab(page, /Basics/).click();
  await settle(page);
  await page.getByRole('button', { name: 'Chicken', exact: true }).click();
  await expect(page.getByText('AH Biologisch Kipfilet 2 stuks')).toBeVisible();
}

test('the ingredient details screen shows no markup', async ({ page }) => {
  await openChickenDetail(page);

  // The supermarket writes descriptionHighlights as HTML, and React Native has
  // nothing that renders markup: an unparsed field lands on the screen as
  // "<p>Deze malse kipfilet is 100% naturel</p><p><ul><li>...", which a baseline
  // records as correct the day it is accepted.
  const text = await page.locator('body').innerText();
  const tags = text.match(/<\/?(p|ul|li|strong)>/gi);

  expect(tags, `the description reached the screen as markup: ${tags}`).toBeNull();
});

test('the details screen keeps the way to the edit screen open', async ({ page }) => {
  await openChickenDetail(page);

  // Details replaced edit on the ingredient image, and the edit screen is the
  // only path to the ingredient's name, its "altijd in huis" switch and the
  // product behind it. Lose the button here and the basics tab has a toggle
  // nothing can reach any more.
  await page.getByRole('button', { name: 'Bewerken' }).first().click();
  // Not the "Altijd in huis" label: the basics tab's own heading says that too,
  // and detachPreviousScreen keeps that screen in the DOM behind this one, so
  // the label matches three times. This sentence belongs to the edit screen.
  await expect(page.getByText(/Als dit aan staat/)).toBeVisible();

  // And back out of edit is back to the details, not out to the list.
  await page.getByRole('button', { name: 'Sluiten' }).first().click();
  await expect(page.getByText('AH Biologisch Kipfilet 2 stuks')).toBeVisible();
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

test('a cart row wears a Nutri-Score only when the supermarket gave one', async ({ page }) => {
  await openApp(page);
  await tab(page, /Mandje/).click();
  await settle(page);

  // Seeded next to three graded products: one the supermarket answers "N/A"
  // for, which used to reach the row as a grey badge reading "N/A". Found by
  // its picture, not its label, because the label sits in the line that carries
  // the badge, so nothing on the row reads as the name on its own.
  await expect(page.getByRole('button', { name: 'Parmezaanse kaas', exact: true })).toHaveCount(1);

  const rows = await page.evaluate(() => {
    const isRow = (el) => {
      const style = getComputedStyle(el);
      return (
        style.borderRadius !== '0px' &&
        style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
        el.children.length === 3 &&
        el.getBoundingClientRect().width > 200
      );
    };

    return Array.from(document.querySelectorAll('div'))
      .filter(isRow)
      .map((row) => {
        const [picture, label, control] = row.children;
        const box = row.getBoundingClientRect();
        // The row's own pill, which is the only one inside the label: the
        // quantity control is a pill too, and it sits outside it.
        const badge = Array.from(label.querySelectorAll('div')).find((el) =>
          getComputedStyle(el).borderRadius.startsWith('999')
        );

        return {
          name: picture.getAttribute('aria-label'),
          badge: badge ? badge.innerText.trim() : null,
          height: Math.round(box.height),
          inset: Math.round(box.right - control.getBoundingClientRect().right),
        };
      });
  });

  expect(rows.length, 'found no cart rows').toBeGreaterThan(1);
  expect(rows.map((row) => row.badge).filter(Boolean).length, 'no graded row').toBeGreaterThan(0);
  expect(
    rows.filter((row) => row.badge === null).map((row) => row.name),
    'a graded row lost its Nutri-Score, or an ungraded one kept an empty badge'
  ).toEqual(['Parmezaanse kaas']);

  // An empty badge is invisible in a screenshot but "N/A" is not, and neither
  // belongs on a row.
  expect(await page.locator('body').innerText()).not.toContain('N/A');

  // And dropping the badge from one row leaves every row where it was: the
  // badge sits inside the label, so it must move neither the row's own height
  // nor the control on the far side of it.
  expect(new Set(rows.map((row) => row.height)).size, 'rows differ in height').toBe(1);
  expect(new Set(rows.map((row) => row.inset)).size, 'trailing insets differ').toBe(1);
});

test('tapping the tab you are already on scrolls that screen to the top', async ({ page }) => {
  await openApp(page);
  await tab(page, /Basics/).click();
  await settle(page);
  // By its picture, not its label: the row's name sits in a line that also
  // carries the ingredient's badges, so nothing there reads as the name alone.
  await expect(page.getByRole('button', { name: 'Appel Pear Juice', exact: true })).toBeVisible();

  const basics = await scroller(page);
  await basics.scrollTo(200);
  expect(await basics.offset(), 'the screen did not scroll').toBe(200);

  // The whole point of a second tap on the tab you are on. The scroll is
  // animated, so it arrives over a few frames rather than at once.
  await tab(page, /Basics/).click();
  await expect
    .poll(basics.offset, { message: 'a second tap on the tab left the screen where it was' })
    .toBe(0);

  // And the other half of the rule: a tap that switches tabs is a tap on a tab
  // you are not on, and it has to leave the screen you are leaving alone.
  // Reading it while the tab is away reads 0 whatever happened, because the
  // navigator hides that screen and a hidden box has no scroll position, so
  // come back to it and look.
  await basics.scrollTo(200);
  await tab(page, /Mandje/).click();
  await expect(page.getByRole('heading', { name: 'Je mandje' })).toBeVisible();
  await tab(page, /Basics/).click();
  await settle(page);
  await expect(page.getByRole('button', { name: 'Appel Pear Juice', exact: true })).toBeVisible();

  expect(await basics.offset(), 'switching tabs scrolled the screen you left').toBe(200);
});
