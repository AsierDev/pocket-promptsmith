import { describe, expect, it } from 'vitest';

import { FREEMIUM_LIMITS, hasReachedPromptLimit, hasReachedImproveLimit } from '@/lib/limits';

describe('freemium limits helpers', () => {
  it('detects when prompt limit is reached', () => {
    expect(hasReachedPromptLimit(FREEMIUM_LIMITS.prompts - 1)).toBe(false);
    expect(hasReachedPromptLimit(FREEMIUM_LIMITS.prompts)).toBe(true);
  });

  it('detects when improve limit is reached', () => {
    expect(hasReachedImproveLimit(FREEMIUM_LIMITS.improvementsPerDay - 1)).toBe(false);
    expect(hasReachedImproveLimit(FREEMIUM_LIMITS.improvementsPerDay)).toBe(true);
  });
});
