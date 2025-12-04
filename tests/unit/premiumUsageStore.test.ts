import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePremiumUsageStore } from '@/features/ai-improvements/premiumUsageStore';
import { FREEMIUM_LIMITS } from '@/lib/limits';

const resetStore = () => {
  const { hydrate, setUsedToday, increment, resetIfNeeded } = usePremiumUsageStore.getState();
  usePremiumUsageStore.setState({
    usedToday: 0,
    limit: FREEMIUM_LIMITS.improvementsPerDay,
    lastResetAt: null,
    hydrated: false,
    hydrate,
    setUsedToday,
    increment,
    resetIfNeeded
  });
};

describe('premiumUsageStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-02T10:00:00Z'));
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetStore();
  });

  it('hydrates respecting limits and daily reset', () => {
    const { hydrate } = usePremiumUsageStore.getState();
    hydrate({ usedToday: 10, limit: 3, lastResetAt: '2024-01-01T08:00:00Z' });

    const state = usePremiumUsageStore.getState();
    expect(state.usedToday).toBe(0);
    expect(state.limit).toBe(3);
    expect(state.hydrated).toBe(true);
    expect(state.lastResetAt).toContain('2024-01-02');
  });

  it('clamps increments to the configured limit', () => {
    const { increment } = usePremiumUsageStore.getState();
    increment(8);
    expect(usePremiumUsageStore.getState().usedToday).toBe(FREEMIUM_LIMITS.improvementsPerDay);
  });

  it('setUsedToday clamps negative values and marks as hydrated', () => {
    const { setUsedToday } = usePremiumUsageStore.getState();
    setUsedToday(-5);
    const state = usePremiumUsageStore.getState();
    expect(state.usedToday).toBe(0);
    expect(state.hydrated).toBe(true);
  });

  it('resetIfNeeded clears usage when the day changes', () => {
    usePremiumUsageStore.setState({
      usedToday: 2,
      lastResetAt: '2024-01-01T05:00:00Z'
    });

    const { resetIfNeeded } = usePremiumUsageStore.getState();
    resetIfNeeded();

    expect(usePremiumUsageStore.getState().usedToday).toBe(0);
  });
});
