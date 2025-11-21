import { notFound } from 'next/navigation';
import { fetchPromptById } from '@/features/prompts/services';
import { UsePromptClient } from '@/features/variables/components/UsePromptClient';

export default async function UsePromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prompt = await fetchPromptById(id).catch(() => null);
  if (!prompt) return notFound();

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="use-prompt-title"
        aria-describedby="use-prompt-description"
        className="flex h-full w-full max-w-full flex-col bg-white/95 px-6 py-6 shadow-2xl backdrop-blur dark:bg-slate-900/95 sm:max-w-[520px] lg:max-w-[40vw]"
      >
        <UsePromptClient prompt={prompt} closeHref="/prompts" />
      </div>
    </div>
  );
}
