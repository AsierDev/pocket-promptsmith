import { PromptForm } from '@/features/prompts/components/PromptForm';
import { getProfile } from '@/lib/supabaseServer';
import { hasReachedPromptLimit } from '@/lib/limits';

export default async function NewPromptPage() {
  const profile = await getProfile();
  const reachedLimit = profile ? hasReachedPromptLimit(profile.prompt_quota_used) : false;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card dark:border-slate-800 dark:bg-slate-900">
      {reachedLimit && (
        <p className="mb-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
          Has alcanzado el límite de 10 prompts. Upgrade a Pro para seguir creando.
        </p>
      )}
      <PromptForm mode="create" disableSubmit={reachedLimit} />
    </div>
  );
}
