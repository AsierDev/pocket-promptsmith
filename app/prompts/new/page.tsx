import { PromptFormWizard } from '@/features/prompts/components/PromptFormWizard';
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
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Mis prompts / Nuevo</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Crear nuevo prompt</h1>
          <p className="mt-1 text-sm text-slate-600">
            Completa los 3 pasos para guardar tu prompt en la biblioteca.
          </p>
        </div>
      </div>

      <PromptFormWizard
        mode="create"
        disableSubmit={reachedLimit}
        autoFocusAiPanel={focusAiPanel}
      />
    </div>
  );
}
