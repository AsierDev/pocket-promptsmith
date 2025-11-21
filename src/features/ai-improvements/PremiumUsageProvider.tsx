'use client';

import { useEffect, type ReactNode } from 'react';
import { FREEMIUM_LIMITS } from '@/lib/limits';
import { usePremiumUsageStore } from '@/features/ai-improvements/premiumUsageStore';

type Props = {
  usedToday: number;
  limit?: number;
  lastResetAt?: string | null;
  children: ReactNode;
};

export const PremiumUsageProvider = ({
  usedToday,
  limit = FREEMIUM_LIMITS.improvementsPerDay,
  lastResetAt,
  children
}: Props) => {
  const hydrate = usePremiumUsageStore((state) => state.hydrate);
  const resetIfNeeded = usePremiumUsageStore((state) => state.resetIfNeeded);

  useEffect(() => {
    hydrate({ usedToday, limit, lastResetAt });
  }, [hydrate, usedToday, limit, lastResetAt]);

  useEffect(() => {
    resetIfNeeded();
  }, [resetIfNeeded]);

  return <>{children}</>;
};
