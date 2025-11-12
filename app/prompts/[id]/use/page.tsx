import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchPromptById } from '@/features/prompts/services';
import { UsePromptClient } from '@/features/variables/components/UsePromptClient';

export default async function UsePromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prompt = await fetchPromptById(id).catch(() => null);
  if (!prompt) return notFound();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/80 px-4 py-10">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-5xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs uppercase text-slate-400">Usar prompt</p>
          <Link
            href="/prompts"
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
          >
            Cerrar
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{prompt.title}</h1>
        <UsePromptClient prompt={prompt} />
      </div>
    </div>
  );
}
