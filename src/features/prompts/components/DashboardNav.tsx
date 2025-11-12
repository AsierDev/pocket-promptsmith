'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { Route } from 'next';

type NavItem =
  | { label: string; href: Route }
  | { label: string; href: { pathname: Route; query?: Record<string, string> } };

const navItems: NavItem[] = [
  { label: 'Mis prompts', href: '/prompts' },
  { label: 'Crear nuevo', href: '/prompts/new' },
  { label: 'Favoritos', href: { pathname: '/prompts', query: { favorites: 'true' } } }
];

export const DashboardNav = () => {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación del dashboard" className="space-y-1">
      {navItems.map((item) => {
        const targetPath = typeof item.href === 'string' ? item.href : item.href.pathname;
        const isActive = pathname === targetPath || pathname.startsWith(`${targetPath}/`);
        return (
          <Link
            key={typeof item.href === 'string' ? item.href : `${item.href.pathname}?favorites=true`}
            href={item.href}
            className={clsx(
              'flex items-center justify-between rounded-2xl px-4 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            {item.label}
            <span aria-hidden>›</span>
          </Link>
        );
      })}
    </nav>
  );
};
