import Link from 'next/link';
import { PromptForm } from '@/features/prompts/components/PromptForm';
import { getProfile } from '@/lib/supabaseServer';
import { hasReachedPromptLimit } from '@/lib/limits';

export default async function NewPromptPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const reachedLimit = profile ? hasReachedPromptLimit(profile.prompt_quota_used) : false;
  const focusAiPanel = params?.ai === '1';

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Mis prompts / Nuevo</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Crear nuevo prompt</h1>
          <p className="text-sm text-slate-500">Define tu idea, agrega variables y guárdala en tu biblioteca.</p>
        </div>
        <Link
          href="/prompts"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700"
        >
          Cerrar
        </Link>
      </div>
      <PromptForm mode="create" disableSubmit={reachedLimit} autoFocusAiPanel={focusAiPanel} />
    </div>
  );
}
