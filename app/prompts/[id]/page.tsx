import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchPromptById } from '@/features/prompts/services';
import { getProfile } from '@/lib/supabaseServer';
import { DeletePromptButton } from '@/features/prompts/components/DeletePromptButton';
import { PromptForm } from '@/features/prompts/components/PromptForm';

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prompt = await fetchPromptById(id).catch(() => null);
  if (!prompt) return notFound();
  const profile = await getProfile();
  const premiumUsed = profile?.improvements_used_today ?? 0;

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Mis prompts / Editar</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editar: {prompt.title}</h1>
          <p className="text-sm text-slate-500">Actualiza el contenido y aplica mejoras con IA sin salir de esta pantalla.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/prompts"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700"
          >
            Cerrar
          </Link>
          <DeletePromptButton promptId={prompt.id} />
        </div>
      </div>
      <PromptForm
        mode="edit"
        defaultValues={{
          id: prompt.id,
          title: prompt.title,
          summary: prompt.summary ?? '',
          content: prompt.content,
          category: prompt.category,
          tags: prompt.tags ?? [],
          thumbnail_url: prompt.thumbnail_url ?? ''
        }}
        premiumImprovementsUsedToday={premiumUsed}
      />
    </div>
  );
}
