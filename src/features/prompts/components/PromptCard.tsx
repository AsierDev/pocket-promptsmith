import Link from 'next/link';
import { FavoriteToggle } from './FavoriteToggle';
import type { PromptRow } from '@/types/supabase';

const categoryTokens: Record<
  PromptRow['category'],
  { dot: string; bg: string; text: string; icon: string }
> = {
  Escritura: { dot: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700', icon: '✍️' },
  Código: { dot: 'bg-sky-500', bg: 'bg-sky-50', text: 'text-sky-700', icon: '</>' },
  Marketing: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', icon: '📣' },
  Análisis: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '📊' },
  Creatividad: { dot: 'bg-violet-500', bg: 'bg-violet-50', text: 'text-violet-700', icon: '✨' },
  Educación: { dot: 'bg-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-700', icon: '📚' },
  Otros: { dot: 'bg-slate-400', bg: 'bg-slate-100', text: 'text-slate-700', icon: '🧩' }
};

const summarize = (content: string) => {
  const sanitized = content.replace(/\s+/g, ' ').trim();
  return sanitized.length > 160 ? `${sanitized.slice(0, 157)}…` : sanitized;
};

const formatDate = (value: string | null) => {
  if (!value) return 'Sin mejoras recientes';
  try {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
      new Date(value)
    );
  } catch {
    return value;
  }
};

interface PromptCardProps {
  prompt: PromptRow;
}

export const PromptCard = ({ prompt }: PromptCardProps) => {
  const category = categoryTokens[prompt.category];
  const summary = summarize(prompt.content || '');
  const tags = prompt.tags?.slice(0, 2) ?? [];
  const lastUpdated = prompt.updated_at ?? prompt.created_at;

  return (
    <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex flex-1 gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" aria-hidden>
          <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${category.bg} text-lg`}>
            {category.icon}
          </span>
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {prompt.title}
            </h3>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium ${category.bg} ${category.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${category.dot}`} aria-hidden />
              {prompt.category}
            </span>
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{summary}</p>
          <p className="text-xs text-slate-500">
            ⭐ Usos: {prompt.use_count} · Última mejora: {formatDate(lastUpdated)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-3">
        <FavoriteToggle promptId={prompt.id} initialFavorite={prompt.is_favorite} />
        <div className="flex items-center gap-2">
          <Link
            href={`/prompts/${prompt.id}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
            aria-label={`Editar ${prompt.title}`}
          >
            ✏️
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
};
