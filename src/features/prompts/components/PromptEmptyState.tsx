import Image from 'next/image';
import Link from 'next/link';

type PromptEmptyStateProps =
  | { variant: 'library' }
  | { variant: 'favorites' }
  | { variant: 'filters'; description?: string };

const baseCardClasses =
  'flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center dark:border-slate-700 dark:bg-slate-900';

export const PromptEmptyState = (props: PromptEmptyStateProps) => {
  if (props.variant === 'favorites') {
    return (
      <div className={baseCardClasses}>
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-3xl">⭐</div>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Aún no tienes favoritos</h3>
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Marca ⭐ cualquier prompt de la lista para que aparezca automáticamente en esta vista.
        </p>
        <Link
          href="/prompts"
          className="mt-6 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200"
        >
          Ver todos los prompts
        </Link>
      </div>
    );
  }

  if (props.variant === 'filters') {
    return (
      <div className={baseCardClasses}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700">
          🔍
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Sin resultados</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {props.description ?? 'No hay prompts que coincidan con estos filtros. Prueba limpiarlos o busca otro término.'}
        </p>
      </div>
    );
  }

  return (
    <div className={baseCardClasses}>
      <Image src="/icons/icon.svg" alt="Pocket Promptsmith" width={96} height={96} className="mb-4" />
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Tu biblioteca está vacía</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Crea tu primer prompt desde cero o deja que la IA te ayude a partir de una idea rápida.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/prompts/new"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Crear prompt desde cero
        </Link>
        <Link
          href="/prompts/new?ai=1"
          className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200"
        >
          Crear prompt con IA
        </Link>
      </div>
    </div>
  );
};
