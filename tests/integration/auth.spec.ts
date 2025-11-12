import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test('renderiza formulario de login y valida email requerido', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
    await page.getByLabel('Email').fill('');
    await page.getByRole('button', { name: 'Enviar enlace mágico' }).click();
    await expect(page.getByText('Introduce un email válido')).toBeVisible();
  });
});
