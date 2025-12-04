'use client';

import { useOptimistic, useTransition } from 'react';

import { toggleFavoriteAction } from '@/features/prompts/actions';

interface FavoriteToggleProps {
  promptId: string;
  initialFavorite: boolean;
}

export const FavoriteToggle = ({ promptId, initialFavorite }: FavoriteToggleProps) => {
  const [optimisticValue, addOptimistic] = useOptimistic(initialFavorite);
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    const next = !optimisticValue;
    startTransition(() => {
      addOptimistic(next);
      toggleFavoriteAction(promptId, next);
    });
  };

  return (
    <button
      type="button"
      aria-pressed={optimisticValue}
      onClick={handleClick}
      className={`rounded-full border p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${optimisticValue
          ? 'border-yellow-400 bg-yellow-50 text-yellow-500 hover:bg-yellow-100 dark:border-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400 dark:hover:bg-yellow-950/70'
          : 'border-slate-200 bg-white/70 text-slate-300 hover:border-yellow-300 hover:bg-yellow-50/50 hover:text-yellow-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600 dark:hover:bg-slate-700'
        }`}
    >
      <span aria-hidden className={pending ? 'animate-pulse' : ''}>
        {optimisticValue ? '★' : '☆'}
      </span>
      <span className="sr-only">Marcar como favorito</span>
    </button>
  );
};
