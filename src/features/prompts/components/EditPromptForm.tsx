'use client';

import { useRef, useState } from 'react';
import type { PromptRow } from '@/types/supabase';
import { PromptForm } from './PromptForm';
import { AiImproveModal } from '@/features/ai-improvements/components/AiImproveModal';

interface Props {
  prompt: PromptRow;
  improveDisabledCopy?: string;
}

export const EditPromptForm = ({ prompt, improveDisabledCopy }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [content, setContent] = useState(prompt.content);
  const updaterRef = useRef<((value: string) => void) | null>(null);

  const handleRegister = (cb: (value: string) => void) => {
    updaterRef.current = cb;
  };

  const handleApply = (value: string) => {
    updaterRef.current?.(value);
    setContent(value);
  };

  return (
    <>
      <PromptForm
        mode="edit"
        defaultValues={{
          id: prompt.id,
          title: prompt.title,
          content: prompt.content,
          category: prompt.category,
          tags: prompt.tags ?? [],
          thumbnail_url: prompt.thumbnail_url ?? ''
        }}
        onImprove={() => setModalOpen(true)}
        improveDisabledCopy={improveDisabledCopy}
        registerContentUpdater={handleRegister}
        onContentChange={setContent}
      />
      <AiImproveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        content={content}
        promptId={prompt.id}
        category={prompt.category}
        onApply={handleApply}
      />
    </>
  );
};
