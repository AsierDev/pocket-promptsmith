'use client';

import { useEffect, useState, useTransition } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { logImprovement } from '@/features/prompts/actions';
import { toast } from 'sonner';
import type { PromptRow } from '@/types/supabase';

interface AiImproveModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
  promptId: string;
  category: PromptRow['category'];
  onApply: (improved: string) => void;
}

interface AiResult {
  improved_prompt: string;
  changes: string[];
  diff: string;
  modelUsed?: string;
}

export const AiImproveModal = ({
  open,
  onClose,
  content,
  promptId,
  category,
  onApply
}: AiImproveModalProps) => {
  const [goal, setGoal] = useState('Hazlo más claro y accionable');
  const [result, setResult] = useState<AiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    if (!open) {
      setResult(null);
    }
  }, [open]);

  const requestImprovement = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/ai-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, goal, category })
      });
      if (!response.ok) {
        throw new Error('La IA no pudo mejorar el prompt');
      }
      const payload = (await response.json()) as AiResult;
      setResult(payload);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    startTransition(async () => {
      try {
        await logImprovement(promptId, content, result.improved_prompt, result.diff);
        onApply(result.improved_prompt);
        toast.success('Contenido actualizado con IA');
        onClose();
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Improve with AI"
      description="Compara los cambios sugeridos y decide si aplicarlos"
      actions={
        <Button onClick={handleApply} disabled={!result} loading={pending}>
          Aplicar cambios
        </Button>
      }
      size="lg"
    >
      <div className="space-y-4 text-sm">
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase text-slate-500">
          Objetivo de mejora
          <input
            type="text"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700"
            placeholder="Hazlo más breve, agrega tono, etc"
          />
        </label>
        <Button onClick={requestImprovement} loading={loading} disabled={loading}>
          Analizar con IA
        </Button>
        {loading && <p className="text-xs text-slate-500">Analizando...</p>}
        {result && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Original</p>
              <pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-100 p-4 text-xs dark:bg-slate-800">
                {content}
              </pre>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Mejorado</p>
              <pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-emerald-50 p-4 text-xs dark:bg-emerald-900/50">
                {result.improved_prompt}
              </pre>
            </div>
          </div>
        )}
        {result?.modelUsed && (
          <p className="text-xs text-slate-500">
            Modelo empleado: <span className="font-semibold">{result.modelUsed}</span>
          </p>
        )}
        {result?.changes && (
          <ul className="list-disc space-y-2 rounded-2xl bg-white/70 p-4 text-xs text-slate-600 dark:bg-slate-800/50">
            {result.changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        )}
        {result?.diff && (
          <pre className="rounded-2xl bg-slate-900/80 p-4 text-xs text-white" aria-label="Diff sugerido">
            {result.diff}
          </pre>
        )}
      </div>
    </Modal>
  );
};
