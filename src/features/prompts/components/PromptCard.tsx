import Link from 'next/link';
import Image from 'next/image';
import { FavoriteToggle } from './FavoriteToggle';
import type { PromptRow } from '@/types/supabase';

const categoryGradients: Record<PromptRow['category'], string> = {
  Escritura: 'from-rose-100 to-pink-100',
  Código: 'from-slate-100 to-sky-100',
  Marketing: 'from-amber-100 to-orange-100',
  Análisis: 'from-emerald-100 to-green-100',
  Creatividad: 'from-violet-100 to-indigo-100',
  Educación: 'from-cyan-100 to-sky-100',
  Otros: 'from-slate-100 to-slate-200'
};

interface PromptCardProps {
  prompt: PromptRow;
}

export const PromptCard = ({ prompt }: PromptCardProps) => (
  <article className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
    <div className="mb-4 overflow-hidden rounded-2xl bg-slate-100">
      {prompt.thumbnail_url ? (
        <Image
          src={prompt.thumbnail_url}
          alt={`${prompt.title} thumbnail`}
          width={600}
          height={320}
          unoptimized
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-violet-50 to-slate-100 text-4xl">
          ✨
        </div>
      )}
    </div>
    <div className="flex items-start justify-between">
      <span
        className={`rounded-full bg-gradient-to-r ${categoryGradients[prompt.category]} px-4 py-1 text-xs font-semibold text-slate-700`}
      >
        {prompt.category}
      </span>
      <FavoriteToggle promptId={prompt.id} initialFavorite={prompt.is_favorite} />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{prompt.title}</h3>
    <p className="mt-2 h-20 overflow-hidden text-sm text-slate-500 dark:text-slate-400">{prompt.content}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      {prompt.tags?.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          #{tag}
        </span>
      ))}
    </div>
    <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <span>Usos: {prompt.use_count}</span>
      <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
    </div>
    <div className="mt-6 flex gap-3">
      <Link
        href={`/prompts/${prompt.id}/use`}
        className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-white"
      >
        Usar prompt
      </Link>
      <Link
        href={`/prompts/${prompt.id}`}
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
      >
        Editar
      </Link>
    </div>
  </article>
);
