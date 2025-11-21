import { expect, test } from '@playwright/test';

test.describe('Uso de variables', () => {
  test('muestra funcionalidad de variables en la landing', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Variables inteligentes')).toBeVisible();
    await expect(page.getByText('Detectamos {{variables}} automáticamente')).toBeVisible();
  });
});
