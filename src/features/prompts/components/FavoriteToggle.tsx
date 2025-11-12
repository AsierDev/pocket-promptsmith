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
      className="rounded-full border border-transparent bg-white/70 p-2 text-yellow-500 transition hover:border-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:bg-slate-800"
    >
      <span aria-hidden className={pending ? 'animate-pulse' : ''}>
        {optimisticValue ? '★' : '☆'}
      </span>
      <span className="sr-only">Marcar como favorito</span>
    </button>
  );
};
