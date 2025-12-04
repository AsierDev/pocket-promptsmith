'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TopTabs() {
    const pathname = usePathname();

    const tabs = [
        {
            href: '/prompts/dashboard' as const,
            label: 'Inicio',
            isActive: pathname === '/prompts/dashboard' || pathname === '/prompts'
        },
        {
            href: '/prompts/library' as const,
            label: 'Biblioteca',
            isActive: pathname?.startsWith('/prompts/library')
        },
        {
            href: '/prompts/new' as const,
            label: 'Crear',
            isActive: pathname === '/prompts/new' || pathname?.startsWith('/prompts/new')
        }
    ] as const;

    return (
        <nav className="hidden items-center gap-1 lg:flex">
            {tabs.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={clsx(
                        'relative px-4 py-2 text-sm font-semibold transition-colors',
                        tab.isActive
                            ? 'text-primary'
                            : 'text-slate-600 hover:text-slate-900'
                    )}
                >
                    {tab.label}
                    {tab.isActive && (
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                    )}
                </Link>
            ))}
        </nav>
    );
}
