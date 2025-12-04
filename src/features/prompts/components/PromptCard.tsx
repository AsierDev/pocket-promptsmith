import Link from 'next/link';
import { memo } from 'react';

import { FavoriteToggle } from '@/features/prompts/components/FavoriteToggle';
import type { PromptRow } from '@/types/supabase';

type CategoryToken = {
  dot: string;
  bg: string;
  text: string;
  icon: string;
  iconColor: string;
};

const categoryTokens: Record<PromptRow['category'], CategoryToken> = {
  Escritura: {
    dot: 'bg-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    icon: '✍️',
    iconColor: 'text-rose-600 dark:text-rose-300'
  },
  Código: {
    dot: 'bg-sky-500',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    icon: '</>',
    iconColor: 'text-sky-600 dark:text-sky-300'
  },
  Marketing: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: '📣',
    iconColor: 'text-amber-600 dark:text-amber-300'
  },
  Análisis: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    icon: '📊',
    iconColor: 'text-emerald-600 dark:text-emerald-300'
  },
  Creatividad: {
    dot: 'bg-violet-500',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    icon: '✨',
    iconColor: 'text-violet-600 dark:text-violet-300'
  },
  Educación: {
    dot: 'bg-cyan-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    icon: '📚',
    iconColor: 'text-cyan-600 dark:text-cyan-300'
  },
  Otros: {
    dot: 'bg-slate-400',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    icon: '🧩',
    iconColor: 'text-slate-600 dark:text-slate-300'
  }
};

const summarize = (content: string, maxLength = 100) => {
  const sanitized = content.replace(/\s+/g, ' ').trim();
  return sanitized.length > maxLength ? `${sanitized.slice(0, maxLength - 1)}…` : sanitized;
};

interface PromptCardProps {
  prompt: PromptRow;
}

export const PromptCard = memo(({ prompt }: PromptCardProps) => {
  const category = categoryTokens[prompt.category];
  const summary = prompt.summary?.trim().length
    ? summarize(prompt.summary.trim())
    : summarize(prompt.content || '');
  const tags = prompt.tags?.slice(0, 2) ?? [];

  return (
    <article className="group relative flex min-h-[160px] flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-card-subtle transition hover:border-primary/50 hover:shadow-card dark:border-slate-800 dark:bg-slate-900/90 sm:flex-row sm:gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12" aria-hidden>
        <span
          className={`flex h-full w-full items-center justify-center rounded-xl text-lg ${category.bg} ${category.iconColor} dark:bg-opacity-20`}
        >
          {category.icon}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {prompt.title}
          </h3>
          <span className={`w-fit inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${category.bg} ${category.text} dark:bg-opacity-25 dark:text-opacity-95`}>
            <span className={`h-1.5 w-1.5 rounded-full ${category.dot}`} aria-hidden />
            {prompt.category}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{summary}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {tags.length > 0 && (
            <div className="flex gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <span className="text-slate-500 dark:text-slate-400">
            Usos: {prompt.use_count}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-start">
        <FavoriteToggle promptId={prompt.id} initialFavorite={prompt.is_favorite} />
        <div className="flex items-center gap-2">
          <Link
            href={`/prompts/${prompt.id}`}
            className="group/edit inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={`Editar ${prompt.title}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </Link>
          <Link
            href={`/prompts/${prompt.id}/use`}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600"
          >
            Usar
          </Link>
        </div>
      </div>
    </article>
  );
});

PromptCard.displayName = 'PromptCard';

