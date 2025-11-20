'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { Route } from 'next';

type NavHref = Route | { pathname: Route; query?: Record<string, string> };

type NavItem = {
  label: string;
  href?: NavHref;
  description?: string;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  {
    label: 'Mis prompts',
    description: 'Todos tus guardados',
    href: '/prompts'
  },
  {
    label: 'Favoritos',
    description: 'Lo que más usas',
    href: { pathname: '/prompts', query: { favorites: 'true' } }
  },
  {
    label: 'Crear nuevo',
    description: 'Desde cero o con IA',
    href: '/prompts/new'
  },
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

  return (
    <nav aria-label="Navegación del dashboard" className="mt-4 space-y-2">
      {navItems.map((item) => {
        const targetPath = typeof item.href === 'string' ? item.href : item.href?.pathname;
        const isActive = targetPath ? pathname === targetPath || pathname.startsWith(`${targetPath}/`) : false;
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
    </nav>
  );
};
