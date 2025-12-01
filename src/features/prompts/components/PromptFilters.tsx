'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PROMPT_CATEGORIES } from '@/features/prompts/schemas';
import { TagInput } from '@/features/prompts/components/TagInput';

interface PromptFiltersProps {
  initialFilters: {
    q?: string;
    category?: string;
    tags?: string[];
    favoritesOnly?: boolean;
    sort?: 'recent' | 'usage' | 'az' | 'favorites';
  };
  suggestedTags?: string[];
}

const sortCopy: Record<'recent' | 'usage' | 'az' | 'favorites', string> = {
  recent: 'Recientes',
  usage: 'Más usados',
  az: 'A-Z',
  favorites: 'Solo favoritos'
};

export const PromptFilters = ({ initialFilters, suggestedTags = [] }: PromptFiltersProps) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialFilters.q ?? '');
  const [category, setCategory] = useState(initialFilters.category ?? '');
  const [tags, setTags] = useState<string[]>(initialFilters.tags ?? []);
  const [favoritesOnly, setFavoritesOnly] = useState(initialFilters.favoritesOnly ?? false);
  const [sort, setSort] = useState(initialFilters.sort ?? 'recent');

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (tags.length) {
      tags.forEach((tag) => params.append('tags', tag));
    }
    if (favoritesOnly) params.set('favorites', 'true');
    if (sort) params.set('sort', sort);
    params.set('page', '1');
    return params;
  }, [query, category, tags, favoritesOnly, sort]);

  const applyFilters = () => {
    router.push(`/prompts/library?${searchParams.toString()}`, { scroll: false });
    const anchor = document.getElementById('library-results-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setTags([]);
    setFavoritesOnly(false);
    setSort('recent');
    router.push('/prompts/library', { scroll: false });
    const anchor = document.getElementById('library-results-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-card-subtle ring-1 ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:ring-slate-800">
      <div className="grid gap-3 lg:grid-cols-3">
        <label className="space-y-1.5 text-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Buscar</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Título, contenido o palabra clave"
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Categoría</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:text-sm"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Todas</option>
            {PROMPT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ordenar por</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:text-sm"
          >
            {Object.entries(sortCopy).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tags</span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">Sugerencias rápidas abajo. Presiona Enter para agregar.</p>
        <TagInput value={tags} onChange={setTags} placeholder="Presiona Enter para agregar" />
        {suggestedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {suggestedTags.slice(0, 6).map((tag) => {
              const isActive = tags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => {
                    if (isActive) return;
                    setTags([...tags, tag]);
                  }}
                  className={`rounded-full border px-3 py-1 transition ${isActive
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-400'
                    }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-slate-600 transition dark:border-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(event) => setFavoritesOnly(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          Solo favoritos
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-full bg-primary px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-violet-600"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </section>
  );
};
