import { notFound } from 'next/navigation';
import { fetchPromptById } from '@/features/prompts/services';
import { getProfile } from '@/lib/supabaseServer';
import { hasReachedImproveLimit } from '@/lib/limits';
import { EditPromptForm } from '@/features/prompts/components/EditPromptForm';
import { DeletePromptButton } from '@/features/prompts/components/DeletePromptButton';

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prompt = await fetchPromptById(id).catch(() => null);
  if (!prompt) return notFound();
  const profile = await getProfile();
  const improveDisabled = profile && hasReachedImproveLimit(profile.improvements_used_today);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-400">Editar prompt</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{prompt.title}</h1>
        </div>
        <DeletePromptButton promptId={prompt.id} />
      </div>
      <EditPromptForm
        prompt={prompt}
        improveDisabledCopy={
          improveDisabled ? 'Has usado 5/5 mejoras hoy. Upgrade a Pro para desbloquear más.' : undefined
        }
      />
    </div>
  );
}
