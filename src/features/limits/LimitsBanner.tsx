'use client';

import { useState } from 'react';
import { FREEMIUM_LIMITS, getPromptUsageCopy } from '@/lib/limits';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

interface Props {
  promptCount: number;
  improvementsUsed: number;
}

export const LimitsBanner = ({ promptCount, improvementsUsed }: Props) => {
  const [open, setOpen] = useState(false);
  const promptsCopy = getPromptUsageCopy(promptCount);

  return (
    <>
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-violet-100 bg-white/70 px-6 py-4 shadow-card dark:border-violet-900 dark:bg-slate-900">
        <div>
          <p className="text-sm font-semibold text-violet-700 dark:text-violet-200">Plan Free</p>
          <p className="text-base text-slate-600 dark:text-slate-300">{promptsCopy}</p>
        </div>
        <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span>Mejoras usadas hoy: {improvementsUsed}/{FREEMIUM_LIMITS.improvementsPerDay}</span>
        </div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Upgrade a Pro
        </Button>
      </section>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Upgrade to Pro"
        description="Desbloquea límites ilimitados y mejoras avanzadas"
        actions={
          <Button onClick={() => setOpen(false)} variant="primary">
            Entendido
          </Button>
        }
      >
        <ul className="list-disc space-y-3 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>Prompts ilimitados sin restricción diaria.</li>
          <li>Mejoras con IA ilimitadas y prioridad en colas.</li>
          <li>Historial avanzado y colaboración.</li>
        </ul>
      </Modal>
    </>
  );
};
