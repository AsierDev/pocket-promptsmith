'use client';

import { create } from 'zustand';
import { FREEMIUM_LIMITS } from '@/lib/limits';

type HydrationPayload = {
  usedToday: number;
  limit?: number;
  lastResetAt?: string | null;
};

type PremiumUsageState = {
  usedToday: number;
  limit: number;
  lastResetAt: string | null;
  hydrated: boolean;
  hydrate: (payload: HydrationPayload) => void;
  setUsedToday: (used: number) => void;
  increment: (nextValue?: number) => void;
  resetIfNeeded: () => void;
};

const nowIsoString = () => new Date().toISOString();

const needsReset = (lastResetAt?: string | null) => {
  if (!lastResetAt) return true;
  const last = new Date(lastResetAt);
  if (Number.isNaN(last.getTime())) return true;
  const now = new Date();
  return (
    last.getUTCFullYear() !== now.getUTCFullYear() ||
    last.getUTCMonth() !== now.getUTCMonth() ||
    last.getUTCDate() !== now.getUTCDate()
  );
};

export const usePremiumUsageStore = create<PremiumUsageState>((set, get) => ({
  usedToday: 0,
  limit: FREEMIUM_LIMITS.improvementsPerDay,
  lastResetAt: null,
  hydrated: false,
  hydrate: ({ usedToday, limit, lastResetAt }) => {
    const effectiveLimit = limit ?? FREEMIUM_LIMITS.improvementsPerDay;
    const shouldReset = needsReset(lastResetAt);
    const nextUsed = shouldReset ? 0 : Math.min(Math.max(usedToday, 0), effectiveLimit);

    set({
      usedToday: nextUsed,
      limit: effectiveLimit,
      lastResetAt: shouldReset ? nowIsoString() : lastResetAt ?? nowIsoString(),
      hydrated: true
    });
  },
  setUsedToday: (used) => {
    const { limit } = get();
    set({
      usedToday: Math.min(Math.max(used, 0), limit),
      lastResetAt: nowIsoString(),
      hydrated: true
    });
  },
  increment: (nextValue) => {
    const { usedToday, limit } = get();
    const nextCount = typeof nextValue === 'number' ? nextValue : usedToday + 1;
    set({
      usedToday: Math.min(Math.max(nextCount, 0), limit),
      lastResetAt: nowIsoString(),
      hydrated: true
    });
  },
  resetIfNeeded: () => {
    const { lastResetAt } = get();
    if (needsReset(lastResetAt)) {
      set({ usedToday: 0, lastResetAt: nowIsoString() });
    }
  }
}));
