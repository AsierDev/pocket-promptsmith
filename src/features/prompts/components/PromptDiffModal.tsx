'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { toast } from 'sonner';

interface PromptDiffModalProps {
  open: boolean;
  onClose: () => void;
  original: string;
  proposal: string;
  changes?: string[];
  modelName?: string;
  loading?: boolean;
  onApply: (value: string) => void;
  onRegenerate?: () => void;
  onChangeProposal: (value: string) => void;
}

export type FeedbackChoice = 'up' | 'down';

export const getNextFeedbackState = (
  current: FeedbackChoice | null,
  selection: FeedbackChoice
): FeedbackChoice | null => {
  if (current === selection) {
    return null;
  }
  return selection;
};

export const PromptDiffModal = ({
  open,
  onClose,
  original,
  proposal,
  changes,
  modelName,
  loading,
  onApply,
  onRegenerate,
  onChangeProposal
}: PromptDiffModalProps) => {
  const [feedback, setFeedback] = useState<FeedbackChoice | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(proposal);
      toast.success('Propuesta copiada');
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  const handleFeedback = (value: FeedbackChoice) => {
    setFeedback((prev) => getNextFeedbackState(prev, value));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Comparar y aplicar mejoras"
      description="Revisa los cambios sugeridos y decide si aplicarlos."
      size="lg"
      actions={
        <>
          <Button variant="secondary" onClick={handleCopy}>
            Copiar propuesta
          </Button>
          <Button onClick={() => onApply(proposal)} loading={loading}>
            Aplicar cambios
          </Button>
        </>
      }
    >
      <p className="text-xs text-slate-500 dark:text-slate-300">
        {modelName ? `Modelo: ${modelName}` : 'Modelo OpenRouter'} · Decide si esta versión se ajusta a lo que buscas.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">Original</p>
          <pre className="mt-2 h-80 w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100">
            {original}
          </pre>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">Propuesta editable</p>
          <textarea
            value={proposal}
            onChange={(event) => onChangeProposal(event.target.value)}
            className="mt-2 h-80 w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm leading-relaxed text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
          />
        </div>
      </div>
      {changes && changes.length > 0 && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          <p className="font-semibold uppercase tracking-wide text-slate-500">Resumen de cambios</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-300">
        <button
          type="button"
          onClick={onRegenerate}
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          Generar otra propuesta
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span>¿Fue útil?</span>
            {feedback && <span className="text-primary">Gracias por tu feedback</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFeedback('up')}
              className={clsx(
                'rounded-full border px-2 py-1 transition',
                feedback === 'up'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-200 text-slate-500 hover:border-primary dark:border-slate-600 dark:text-slate-300'
              )}
              aria-pressed={feedback === 'up'}
            >
              👍
            </button>
            <button
              type="button"
              onClick={() => handleFeedback('down')}
              className={clsx(
                'rounded-full border px-2 py-1 transition',
                feedback === 'down'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-200 text-slate-500 hover:border-primary dark:border-slate-600 dark:text-slate-300'
              )}
              aria-pressed={feedback === 'down'}
            >
              👎
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
