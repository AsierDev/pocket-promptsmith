import { test, expect } from '@playwright/test';

test.describe('Dashboard de prompts', () => {
  test('protege rutas sin sesión', async ({ page }) => {
    await page.goto('/prompts');
    await expect(page).toHaveURL(/\/login/);
  });
});
