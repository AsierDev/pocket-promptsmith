import { describe, expect, it } from 'vitest';
import { resolveAiRequestOptions } from '@/features/ai-improvements/client';

describe('AI request options', () => {
  it('defaults to safe values when no overrides are provided', () => {
    expect(resolveAiRequestOptions()).toEqual({ goal: undefined, temperature: 0.2, maxTokens: 3000 });
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
