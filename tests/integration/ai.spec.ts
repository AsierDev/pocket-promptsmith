import { expect, test } from '@playwright/test';

test.describe('Mejoras con IA', () => {
  test('protege la ruta de mejora vía API cuando no hay sesión', async ({ request }) => {
    const response = await request.post('/api/ai-improve', {
      data: { content: 'Hola', category: 'Otros' }
    });
    expect(response.status()).toBe(401);
  });

  test('redirige a login cuando se visita la creación de prompts sin sesión', async ({ page }) => {
    await page.goto('/prompts/new');
    await expect(page).toHaveURL(/\/login/);
  });
});
