'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/common/Button';
import type { PromptFormValues } from '@/features/prompts/schemas';
import { PromptDiffModal } from './PromptDiffModal';
import { logImprovement } from '@/features/prompts/actions';
import clsx from 'clsx';
import { FREEMIUM_LIMITS } from '@/lib/limits';
import { isPremiumModel } from '@/features/ai-improvements/models';

interface PromptAIHelperPanelProps {
  promptId?: string;
  mode: 'create' | 'edit';
  content: string;
  category: PromptFormValues['category'];
  onApply: (value: string) => void;
  autoFocus?: boolean;
  initialPremiumUsed?: number;
}

interface AiResult {
  improved_prompt: string;
  changes: string[];
  diff: string;
  modelUsed?: string;
  premiumImprovementsUsedToday?: number;
}

const goalPresets = [
  {
    label: 'Hazlo más claro',
    value: 'Haz que el prompt sea más claro y directo sin perder el tono original.'
  },
  {
    label: 'Más estructurado',
    value: 'Convierte el prompt en pasos bien organizados con bullets o secciones numeradas.'
  },
  {
    label: 'Optimiza para código',
    value: 'Pide ejemplos de código y estándares técnicos concretos para desarrolladores.'
  },
  {
    label: 'Más conciso',
    value: 'Reduce repeticiones y resume en menos palabras manteniendo las instrucciones clave.'
  }
];

const lengthOptions: Array<{ value: 'short' | 'medium' | 'long'; label: string }> = [
  { value: 'short', label: 'Corto' },
  { value: 'medium', label: 'Medio' },
  { value: 'long', label: 'Largo' }
];

export const PromptAIHelperPanel = ({
  promptId,
  mode,
  content,
  category,
  onApply,
  autoFocus,
  initialPremiumUsed = 0
}: PromptAIHelperPanelProps) => {
  const [goal, setGoal] = useState('Hazlo más claro y accionable');
  const [temperature, setTemperature] = useState(40);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [proposalDraft, setProposalDraft] = useState('');
  const [sourceContent, setSourceContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [applyPending, startApplyTransition] = useTransition();
  const [premiumUsedToday, setPremiumUsedToday] = useState(initialPremiumUsed);
  const goalInputRef = useRef<HTMLTextAreaElement>(null);
  const premiumLimit = FREEMIUM_LIMITS.improvementsPerDay;
  const hasPremiumLeft = premiumUsedToday < premiumLimit;
  const premiumInfoMessage = hasPremiumLeft
    ? 'Todavía cuentas con modelos premium antes de agotar las 5 mejoras diarias.'
    : 'Has agotado las 5 mejoras premium de hoy. A partir de ahora usaremos modelos gratuitos (pueden ser algo menos consistentes).';

  useEffect(() => {
    setPremiumUsedToday(initialPremiumUsed);
  }, [initialPremiumUsed]);

  useEffect(() => {
    if (autoFocus) {
      goalInputRef.current?.focus();
    }
  }, [autoFocus]);
  useEffect(() => {
    if (typeof result?.premiumImprovementsUsedToday === 'number') {
      setPremiumUsedToday(result.premiumImprovementsUsedToday);
    }
  }, [result?.premiumImprovementsUsedToday]);

  const requestImprovement = async () => {
    if (!content || content.trim().length < 20) {
      toast.error('Agrega más contenido antes de mejorar con IA');
      return;
    }
    setLoading(true);
    setSourceContent(content);
    try {
      const response = await fetch('/api/ai-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          goal,
          category,
          temperature: temperature / 100,
          length
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'La IA no pudo mejorar el prompt');
      }
      const data = (await response.json()) as AiResult;
      setResult(data);
      setProposalDraft(data.improved_prompt);
      setPremiumUsedToday((prev) => {
        if (typeof data.premiumImprovementsUsedToday === 'number') {
          return data.premiumImprovementsUsedToday;
        }
        if (isPremiumModel(data.modelUsed)) {
          return Math.min(prev + 1, premiumLimit);
        }
        return prev;
      });
      toast.success('Propuesta lista para revisar');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (value: string) => {
    if (!result) return;
    startApplyTransition(async () => {
      try {
        if (mode === 'edit' && promptId) {
          await logImprovement(promptId, sourceContent, value, result.diff);
        }
        onApply(value);
        toast.success('Contenido actualizado con la propuesta');
        setDiffOpen(false);
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  const handleCopyProposal = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.improved_prompt);
      toast.success('Propuesta copiada');
    } catch (error) {
      toast.error('No se pudo copiar');
    }
  };

  const handleRegenerate = () => {
    setDiffOpen(false);
    void requestImprovement();
  };

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-300">Ayuda con IA</p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Mejorar este prompt</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Describe qué necesitas y recibe una versión lista para comparar.
        </p>
      </div>
      <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-100">
          <span>Mejoras premium hoy</span>
          <span className="font-mono text-sm">
            {Math.min(premiumUsedToday, premiumLimit)} / {premiumLimit}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">{premiumInfoMessage}</p>
      </div>
      <div className="mt-4 space-y-3">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">¿Cómo quieres que la IA mejore este prompt?</span>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Opcional. Ejemplos: hazlo más conciso, más estructurado, añade ejemplos, etc.
          </p>
          <textarea
            ref={goalInputRef}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="Hazlo más claro y accionable"
            rows={3}
            className="w-full min-h-[90px] resize-y rounded-2xl border border-slate-200 px-4 py-2 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {goalPresets.map((preset) => {
            const isSelected = goal === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setGoal(preset.value)}
                className={clsx(
                  'rounded-full border px-3 py-1 text-xs font-medium transition',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary dark:border-slate-700'
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-primary dark:border-slate-700"
        >
          Opciones avanzadas
          <span aria-hidden>{advancedOpen ? '−' : '+'}</span>
        </button>
        {advancedOpen && (
          <div className="space-y-4 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Preciso</span>
                <span>Creativo</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={temperature}
                onChange={(event) => setTemperature(Number(event.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div className="flex gap-2">
              {lengthOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex-1 cursor-pointer rounded-2xl border px-3 py-2 text-center text-xs font-semibold transition ${
                    length === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 text-slate-500 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="ai-length"
                    value={option.value}
                    checked={length === option.value}
                    onChange={() => setLength(option.value)}
                    className="hidden"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        )}
        <Button type="button" onClick={requestImprovement} loading={loading} className="w-full">
          Generar mejora
        </Button>
        {result && (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/70">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
              <span>Versión propuesta</span>
              {result.modelUsed && (
                <span className="flex items-center gap-2">
                  Modelo: {result.modelUsed}
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      isPremiumModel(result.modelUsed)
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'
                    )}
                  >
                    {isPremiumModel(result.modelUsed) ? 'premium' : 'gratis'}
                  </span>
                </span>
              )}
            </div>
            <pre className="min-h-[240px] max-h-[420px] overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words rounded-2xl border border-slate-100 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100">
              {result.improved_prompt}
            </pre>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => setDiffOpen(true)}>
                Ver diff y aplicar…
              </Button>
              <Button type="button" variant="secondary" onClick={handleCopyProposal}>
                Copiar propuesta
              </Button>
              <button
                type="button"
                onClick={requestImprovement}
                className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
              >
                Generar otra propuesta
              </button>
            </div>
          </div>
        )}
      </div>
      <PromptDiffModal
        open={diffOpen}
        onClose={() => setDiffOpen(false)}
        original={sourceContent}
        proposal={proposalDraft}
        changes={result?.changes ?? []}
        modelName={result?.modelUsed}
        onApply={handleApply}
        loading={applyPending}
        onRegenerate={handleRegenerate}
        onChangeProposal={setProposalDraft}
      />
    </aside>
  );
};
