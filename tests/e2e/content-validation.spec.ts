import { expect, test } from '@playwright/test';

/*
 * `npm run validate:content` — plan R4. Runs every reference / alternate / known-wrong solution
 * through the real DuckDB-WASM and Pyodide engines via the /dev/validate route.
 */
test('every lesson answer is verified by the real engines', async ({ page }) => {
  test.setTimeout(600_000);
  await page.goto('/dev/validate');
  const summary = page.getByTestId('validate-summary');
  await expect(summary).toHaveAttribute('data-done', 'true', { timeout: 540_000 });
  const fails = await page.getByTestId('validate-fail').allInnerTexts();
  expect(fails, `Failing checks:\n${fails.join('\n')}`).toEqual([]);
  await expect(summary).toContainText('PASS');
});
