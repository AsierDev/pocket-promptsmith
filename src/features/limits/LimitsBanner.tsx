'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { usePremiumUsageStore } from '@/features/ai-improvements/premiumUsageStore';
import { FREEMIUM_LIMITS, getPromptUsageCopy } from '@/lib/limits';

interface Props {
  promptCount: number;
}

export const LimitsBanner = ({ promptCount }: Props) => {
  const [open, setOpen] = useState(false);
  const improvementsUsed = usePremiumUsageStore((state) => state.usedToday);
  const premiumLimit = usePremiumUsageStore((state) => state.limit);
  const promptsCopy = getPromptUsageCopy(promptCount);
  const hasPremiumLeft = improvementsUsed < premiumLimit;

  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Plan Free</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{promptsCopy}</p>
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Mejoras premium hoy: {Math.min(improvementsUsed, premiumLimit)}/{premiumLimit}
          </p>
          <p className="text-[11px]">
            {hasPremiumLeft ? 'Usa IA con modelos premium.' : 'Ahora usamos modelos gratuitos hasta mañana.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Ver detalles del plan
          </Button>
          <Button variant="ghost" disabled title="Próximamente">
            Upgrade a Pro
          </Button>
        </div>
      </section>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Plan Free"
        description="Estos son los límites actuales mientras preparamos Pocket Promptsmith Pro."
        actions={
          <Button onClick={() => setOpen(false)} variant="primary">
            Entendido
          </Button>
        }
      >
        <ul className="list-disc space-y-3 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <strong>{FREEMIUM_LIMITS.prompts} prompts</strong> activos en tu biblioteca.
          </li>
          <li>
            <strong>{FREEMIUM_LIMITS.improvementsPerDay} mejoras con IA</strong> por día calendario.
          </li>
          <li>Historial de mejoras, colecciones y colaboración llegarán pronto.</li>
        </ul>
      </Modal>
    </>
  );
};
