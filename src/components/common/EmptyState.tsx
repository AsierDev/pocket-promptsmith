import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref: Route;
  actionLabel: string;
}

export const EmptyState = ({ title, description, actionHref, actionLabel }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
    <Image src="/icons/icon.svg" alt="Pocket Promptsmith logo" width={120} height={120} className="mb-6" />
    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h3>
    <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
    <Link
      href={actionHref}
      className="mt-6 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {actionLabel}
    </Link>
  </div>
);
