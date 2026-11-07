import { expect, test } from '@playwright/test';

test('every main page renders without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  for (const [path, heading] of [
    ['/', /Day one|today counts|chain going|Welcome back/],
    ['/learn', /One route/],
    ['/review', /Nothing due|Recall/],
    ['/playground', /Break things/],
    ['/settings', /Your setup/],
    ['/learn/sql.s1.where', /Filtering rows/],
    ['/learn/py.p0.collections', /Lists, dicts/],
    ['/nope', /No rows returned/],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
  }
  expect(errors).toEqual([]);
});

test('no horizontal scroll on Today and a lesson', async ({ page }) => {
  for (const path of ['/', '/learn', '/learn/sql.s1.order-limit-distinct']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
  }
});

test('lesson loop: predict → run → exercise → quiz → review card appears', async ({ page }) => {
  await page.goto('/learn/sql.s0.tables-and-pipelines');

  // Predict gate
  const run = page.getByRole('button', { name: 'Predict first' });
  await expect(run).toBeDisabled();
  await page.getByLabel('5', { exact: true }).check();
  await page.getByRole('button', { name: 'Lock in prediction' }).click();
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Example result' })).toBeVisible({ timeout: 60_000 });

  // Exercise
  const ex = page.getByTestId('exercise-all-products');
  await ex.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText('SELECT * FROM products');
  await ex.getByRole('button', { name: 'Check answer' }).click();
  await expect(ex.getByText('Correct', { exact: true })).toBeVisible({ timeout: 60_000 });

  // Quiz: always pick the first option (correct in this lesson's data for some, not all)
  const questions = 5;
  for (let i = 0; i < questions; i++) {
    const q = page.locator('fieldset').filter({ hasText: `Question ${i + 1} of ${questions}` });
    await q.locator('input').first().check();
    await q.getByRole('button', { name: 'Submit answer' }).click();
  }
  await expect(page.getByText('Lesson complete')).toBeVisible();
  await expect(page.getByText(/review cards? added/)).toBeVisible();

  // The Learn page shows it as done; Review offers the cards that are due
  await page.goto('/learn');
  await expect(page.getByRole('link', { name: /Tables, and where SQL lives/ })).toContainText('done');
});
