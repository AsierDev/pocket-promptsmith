'use client';

import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { toast } from 'sonner';

interface PromptDiffModalProps {
  open: boolean;
  onClose: () => void;
  original: string;
  proposal: string;
  changes?: string[];
  diff?: string;
  modelName?: string;
  loading?: boolean;
  onApply: (value: string) => void;
  onRegenerate?: () => void;
  onChangeProposal: (value: string) => void;
}

export const PromptDiffModal = ({
  open,
  onClose,
  original,
  proposal,
  changes,
  diff,
  modelName,
  loading,
  onApply,
  onRegenerate,
  onChangeProposal
}: PromptDiffModalProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(proposal);
      toast.success('Propuesta copiada');
    } catch {
      toast.error('No se pudo copiar');
    }
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
      <p className="text-xs text-slate-500">
        {modelName ? `Modelo: ${modelName}` : 'Modelo OpenRouter'} · Decide si esta versión se ajusta a lo que buscas.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Original</p>
          <pre className="mt-2 max-h-80 overflow-auto rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed dark:bg-slate-800">
            {original}
          </pre>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Propuesta editable</p>
          <textarea
            value={proposal}
            onChange={(event) => onChangeProposal(event.target.value)}
            className="mt-2 h-80 w-full rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
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
      {diff && (
        <pre className="mt-4 max-h-56 overflow-auto rounded-2xl bg-slate-900/90 p-4 text-xs text-slate-100" aria-label="Diff sugerido">
          {diff}
        </pre>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <button type="button" onClick={onRegenerate} className="font-semibold text-primary underline-offset-2 hover:underline">
          Generar otra propuesta
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span>¿Fue útil?</span>
          <button type="button" className="rounded-full border border-slate-200 px-2 py-1 hover:border-primary">
            👍
          </button>
          <button type="button" className="rounded-full border border-slate-200 px-2 py-1 hover:border-primary">
            👎
          </button>
        </div>
      </div>
    </Modal>
  );
};
