import { expect, test } from '@playwright/test';

/* Phase 2 validation (plan): a query renders a table; an infinite loop times out AND the engine recovers. */

test('SQL: running a query in the playground renders a result table', async ({ page }) => {
  await page.goto('/playground');
  await page.getByRole('button', { name: /^Run/ }).click();
  const table = page.getByRole('region', { name: 'Query result' });
  await expect(table).toBeVisible({ timeout: 60_000 });
  await expect(table.getByRole('columnheader').first()).toContainText('country');
  await expect(page.getByText(/rows? ·/)).toBeVisible();
});

test('SQL: decimals, dates and NULLs come through as readable values', async ({ page }) => {
  await page.goto('/playground');
  const editor = page.locator('.cm-content').first();
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText('SELECT amount, order_date, NULL AS nothing FROM orders WHERE order_id = 101');
  await page.getByRole('button', { name: /^Run/ }).click();
  const table = page.getByRole('region', { name: 'Query result' });
  await expect(table).toContainText('114.49');
  await expect(table).toContainText('2024-02-01');
  await expect(table).toContainText('NULL');
});

test('Python: infinite loop times out, then the next run works', async ({ page }) => {
  await page.goto('/playground');
  await page.getByRole('tab', { name: /Python/ }).click();
  const editor = page.locator('.cm-content').first();
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText('while True:\n    pass');
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(page.getByText('Timed out')).toBeVisible({ timeout: 120_000 });

  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText('print(6 * 7)');
  await page.getByRole('button', { name: /^Run/ }).click();
  await expect(page.getByLabel('Output')).toHaveText('42', { timeout: 120_000 });
});
