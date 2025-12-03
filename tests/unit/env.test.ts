import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

describe('env validation', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('exposes parsed env values when configuration is valid', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.OPENROUTER_API_KEY = 'router-key';
    process.env.OPENROUTER_BASE_URL = 'https://router.test';
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

    const { env } = await import('@/lib/env');

    expect(env.supabaseUrl).toBe('https://example.supabase.co');
    expect(env.supabaseAnonKey).toBe('anon-key');
    expect(env.openRouterKey).toBe('router-key');
    expect(env.openRouterUrl).toBe('https://router.test');
    expect(env.googleClientId).toBe('google-client-id');
    expect(env.googleClientSecret).toBe('google-client-secret');
    expect(env.siteUrl).toBe('https://example.com');
  });

  it('throws a descriptive error when required env vars are missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
    process.env.OPENROUTER_API_KEY = '';
    delete process.env.OPENROUTER_BASE_URL;

    await expect(import('@/lib/env')).rejects.toThrow(
      /Configuración de entorno inválida/
    );
  });
});
