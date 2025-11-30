'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            href: '/prompts/dashboard' as const,
            label: 'Inicio',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                </svg>
            ),
            isActive: pathname === '/prompts/dashboard' || pathname === '/prompts'
        },
        {
            href: '/prompts/library' as const,
            label: 'Biblioteca',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                    />
                </svg>
            ),
            isActive: pathname?.startsWith('/prompts/library')
        },
        {
            href: '/prompts/new' as const,
            label: 'Crear',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            ),
            isActive: pathname === '/prompts/new' || pathname?.startsWith('/prompts/new')
        }
    ] as const;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 pb-safe backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 lg:hidden">
            <div className="flex items-center justify-around py-2 pb-3">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                            item.isActive
                                ? 'text-primary'
                                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                        )}
                    >
                        <div className={clsx(item.isActive && 'scale-110 transition-transform')}>
                            {item.icon}
                        </div>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
