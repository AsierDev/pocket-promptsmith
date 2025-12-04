import { describe, expect, it, vi } from 'vitest';

import { resolveAiRequestOptions } from '@/features/ai-improvements/client';

vi.mock('@/lib/env', () => ({
  env: {
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-key',
    googleClientId: 'test-google-id',
    googleClientSecret: 'test-google-secret',
    openRouterKey: 'test-router-key',
    openRouterUrl: 'https://test.openrouter.ai',
    siteUrl: 'https://test.com'
  }
}));

describe('AI request options', () => {
  it('defaults to safe values when no overrides are provided', () => {
    expect(resolveAiRequestOptions()).toEqual({
      goal: undefined,
      temperature: 0.2,
      maxTokens: 3000
    });
  });

  it('clamps temperature values and trims goal text', () => {
    expect(
      resolveAiRequestOptions({
        goal: '  añade ejemplos  ',
        temperature: 2,
        length: 'short'
      })
    ).toEqual({ goal: 'añade ejemplos', temperature: 1, maxTokens: 512 });
  });

  it('respects the selected length option', () => {
    expect(resolveAiRequestOptions({ length: 'long' }).maxTokens).toBe(4096);
  });
});
