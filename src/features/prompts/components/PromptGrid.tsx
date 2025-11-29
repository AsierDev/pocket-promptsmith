import Link from 'next/link';
import { PromptCard } from './PromptCard';
import type { PromptRow } from '@/types/supabase';
import type { Route } from 'next';

interface PromptGridProps {
  prompts: PromptRow[];
  total: number;
  pageSize: number;
  currentPage: number;
  searchParams: Record<string, string | string[] | undefined>;
}

const buildPageHref = (
  page: number,
  searchParams: Record<string, string | string[] | undefined>
): Route => {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === 'page') return;
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (value) {
      params.set(key, value);
    }
  });
  params.set('page', String(page));
  return `/prompts/library?${params.toString()}` as Route;
};

export const PromptGrid = ({ prompts, total, pageSize, currentPage, searchParams }: PromptGridProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const prevHref = buildPageHref(Math.max(1, currentPage - 1), searchParams);
  const nextHref = buildPageHref(Math.min(totalPages, currentPage + 1), searchParams);

  return (
    <section className="space-y-6">
      {/* Responsive Grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex gap-2">
          {canPrev ? (
            <Link
              href={prevHref}
              className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700"
            >
              Anterior
            </Link>
          ) : (
            <span
              aria-disabled="true"
              role="link"
              tabIndex={-1}
              className="rounded-full border border-slate-100 px-4 py-2 text-slate-400 dark:border-slate-800"
            >
              Anterior
            </span>
          )}
          {canNext ? (
            <Link
              href={nextHref}
              className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700"
            >
              Siguiente
            </Link>
          ) : (
            <span
              aria-disabled="true"
              role="link"
              tabIndex={-1}
              className="rounded-full border border-slate-100 px-4 py-2 text-slate-400 dark:border-slate-800"
            >
              Siguiente
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
