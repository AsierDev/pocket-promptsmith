'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import type { Route } from 'next';

type NavHref = Route | { pathname: Route; query?: Record<string, string> };

type NavItem = {
  label: string;
  href?: NavHref;
  description?: string;
  disabled?: boolean;
  section?: 'library' | 'favorites';
};

export type LibrarySection = 'library' | 'favorites' | 'other';

export const resolveLibrarySection = (
  pathname: string,
  favoritesParam?: string | null
): LibrarySection => {
  if (!pathname?.startsWith('/prompts')) return 'other';
  const isFavorites = favoritesParam === 'true';
  if (pathname === '/prompts' && isFavorites) return 'favorites';
  if (pathname === '/prompts' && !isFavorites) return 'library';
  return 'other';
};

const navItems: NavItem[] = [
  {
    label: 'Mis prompts',
    description: 'Todos tus guardados',
    href: '/prompts',
    section: 'library'
  },
  {
    label: 'Favoritos',
    description: 'Lo que más usas',
    href: { pathname: '/prompts', query: { favorites: 'true' } },
    section: 'favorites'
  }
];

const actionItem: NavItem = {
  label: 'Crear nuevo',
  description: 'Desde cero o con IA',
  href: '/prompts/new'
};

const upcomingItems: NavItem[] = [
  {
    label: 'Colecciones',
    description: 'Agrupa prompts (próx.)',
    disabled: true
  },
  {
    label: 'Historial IA',
    description: 'Ver mejoras pasadas (próx.)',
    disabled: true
  }
];

export const DashboardNav = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = resolveLibrarySection(pathname, searchParams?.get('favorites'));

  return (
    <nav aria-label="Navegación del dashboard" className="mt-4 space-y-2">
      {navItems.map((item) => {
        const isActive = item.section ? currentSection === item.section : false;
        const baseClasses =
          'flex flex-col rounded-2xl border px-4 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
        const content = (
          <>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{item.label}</span>
              {item.disabled ? (
                <span className="text-xs text-slate-400">Próx.</span>
              ) : (
                <span className="text-xs text-slate-400">›</span>
              )}
            </div>
            {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
          </>
        );

        if (item.disabled || !item.href) {
          return (
            <div
              key={item.label}
              className={clsx(baseClasses, 'cursor-not-allowed border-dashed border-slate-200 text-slate-400')}
              aria-disabled="true"
            >
              {content}
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={clsx(
              baseClasses,
              isActive
                ? 'border-primary/60 bg-primary/10 text-primary'
                : 'border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary dark:border-slate-700'
            )}
          >
            {content}
          </Link>
        );
      })}
      <Link
        href={actionItem.href!}
        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <span>{actionItem.label}</span>
        <span aria-hidden className="text-lg text-primary">+</span>
      </Link>
      <div className="pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Próximamente</p>
        <div className="mt-3 space-y-2">
          {upcomingItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400"
              aria-disabled="true"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.label}</span>
                <span className="text-xs">Próx.</span>
              </div>
              {item.description && <p className="text-xs">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};
