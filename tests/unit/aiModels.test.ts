import { describe, expect, it } from 'vitest';

import {
  getModelsForImprovement,
  PREMIUM_MODELS,
  FREE_MODELS,
  isPremiumModel
} from '@/features/ai-improvements/models';

describe('AI model selection helpers', () => {
  it('returns premium models while quota remains', () => {
    expect(getModelsForImprovement(0)).toEqual(PREMIUM_MODELS);
    expect(getModelsForImprovement(4)).toEqual(PREMIUM_MODELS);
  });

  it('falls back to free models once the premium quota is reached', () => {
    expect(getModelsForImprovement(5)).toEqual(FREE_MODELS);
    expect(getModelsForImprovement(10)).toEqual(FREE_MODELS);
  });

  it('detects premium models correctly', () => {
    expect(isPremiumModel(PREMIUM_MODELS[0])).toBe(true);
    expect(isPremiumModel(FREE_MODELS[0])).toBe(false);
    expect(isPremiumModel(undefined)).toBe(false);
  });
});
