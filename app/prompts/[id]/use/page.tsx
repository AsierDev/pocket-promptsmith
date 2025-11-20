import { notFound } from 'next/navigation';
import { fetchPromptById } from '@/features/prompts/services';
import { UsePromptClient } from '@/features/variables/components/UsePromptClient';

export default async function UsePromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prompt = await fetchPromptById(id).catch(() => null);
  if (!prompt) return notFound();

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/70 backdrop-blur">
      <div
        role="dialog"
        aria-modal="true"
        className="flex h-full w-full max-w-xl flex-col bg-white px-6 py-6 shadow-2xl dark:bg-slate-900"
      >
        <UsePromptClient prompt={prompt} closeHref="/prompts" />
      </div>
    </div>
  );
}
