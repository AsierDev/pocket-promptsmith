'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PROMPT_CATEGORIES } from '@/features/prompts/schemas';
import { TagInput } from './TagInput';

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
    if (tags.length) params.set('tags', tags.join(','));
    if (favoritesOnly) params.set('favorites', 'true');
    if (sort) params.set('sort', sort);
    params.set('page', '1');
    return params;
  }, [query, category, tags, favoritesOnly, sort]);

  const applyFilters = () => {
    router.push(`/prompts?${searchParams.toString()}`);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setTags([]);
    setFavoritesOnly(false);
    setSort('recent');
    router.push('/prompts');
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Buscar</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Título o contenido"
            className="w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Categoría</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
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
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2 text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Tags</span>
          <TagInput value={tags} onChange={setTags} placeholder="Presiona Enter para agregar" />
          {suggestedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {suggestedTags.slice(0, 6).map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => {
                    if (!tags.includes(tag)) setTags([...tags, tag]);
                  }}
                  className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Ordenar por</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
          >
            <option value="recent">Fecha (reciente)</option>
            <option value="usage">Más usados</option>
            <option value="az">A-Z</option>
            <option value="favorites">Solo favoritos</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(event) => setFavoritesOnly(event.target.checked)}
          />
          Solo favoritos
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 dark:border-slate-700"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </section>
  );
};
