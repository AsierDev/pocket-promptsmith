import { test } from '@playwright/test';

test.describe.skip('Mejoras con IA', () => {
  test('requiere API Key válida para ejecutarse', async () => {
    // Este test se habilita en entornos donde exista OPENROUTER_API_KEY.
  });
});
