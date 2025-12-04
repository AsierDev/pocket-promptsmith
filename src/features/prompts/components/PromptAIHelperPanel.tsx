'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/common/Button';
import { CopyProposalButton } from '@/components/common/CopyProposalButton';
import { isPremiumModel } from '@/features/ai-improvements/models';
import { usePremiumUsageStore } from '@/features/ai-improvements/premiumUsageStore';
import { logImprovement } from '@/features/prompts/actions';
import { PromptDiffModal } from '@/features/prompts/components/PromptDiffModal';
import {
  AI_IMPROVEMENT_SOURCE_MAX_LENGTH,
  type PromptFormValues
} from '@/features/prompts/schemas';

interface PromptAIHelperPanelProps {
  promptId?: string;
  mode: 'create' | 'edit';
  content: string;
  category: PromptFormValues['category'];
  onApply: (value: string) => void;
  autoFocus?: boolean;
  aiImprovementSource: string;
  onChangeAiImprovementSource: (value: string) => void;
  aiImprovementLimit?: number;
  aiImprovementError?: string;
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
    value:
      'Haz que el prompt sea más claro y directo sin perder el tono original.'
  },
  {
    label: 'Más estructurado',
    value:
      'Convierte el prompt en pasos bien organizados con bullets o secciones numeradas.'
  },
  {
    label: 'Optimiza para código',
    value:
      'Pide ejemplos de código y estándares técnicos concretos para desarrolladores.'
  },
  {
    label: 'Más conciso',
    value:
      'Reduce repeticiones y resume en menos palabras manteniendo las instrucciones clave.'
  }
];

const lengthOptions: Array<{
  value: 'short' | 'medium' | 'long';
  label: string;
}> = [
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
  aiImprovementSource,
  onChangeAiImprovementSource,
  aiImprovementLimit = AI_IMPROVEMENT_SOURCE_MAX_LENGTH,
  aiImprovementError
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
  const premiumUsedToday = usePremiumUsageStore((state) => state.usedToday);
  const premiumLimit = usePremiumUsageStore((state) => state.limit);
  const setPremiumUsedToday = usePremiumUsageStore(
    (state) => state.setUsedToday
  );
  const incrementPremiumUsed = usePremiumUsageStore((state) => state.increment);
  const resetPremiumUsageIfNeeded = usePremiumUsageStore(
    (state) => state.resetIfNeeded
  );
  const goalInputRef = useRef<HTMLTextAreaElement>(null);
  const hasPremiumLeft = premiumUsedToday < premiumLimit;
  const premiumInfoMessage = hasPremiumLeft
    ? `Todavía cuentas con modelos premium antes de agotar las ${premiumLimit} mejoras diarias.`
    : `Has agotado las ${premiumLimit} mejoras premium de hoy. A partir de ahora usaremos modelos gratuitos (pueden ser algo menos consistentes).`;
  const trimmedAiSource = aiImprovementSource?.trim() ?? '';
  const aiImprovementLength = aiImprovementSource?.length ?? 0;
  const aiImprovementOverLimit = aiImprovementLength > aiImprovementLimit;
  const improvementFieldError =
    aiImprovementError ||
    (aiImprovementOverLimit
      ? `Máximo ${aiImprovementLimit} caracteres`
      : undefined);
  const fullContentLength = content.trim().length;
  const cannotImproveWithFullPrompt =
    !trimmedAiSource && fullContentLength > aiImprovementLimit;
  const disableGenerate =
    loading || Boolean(improvementFieldError) || cannotImproveWithFullPrompt;

  useEffect(() => {
    resetPremiumUsageIfNeeded();
  }, [resetPremiumUsageIfNeeded]);

  useEffect(() => {
    if (autoFocus) {
      goalInputRef.current?.focus();
    }
  }, [autoFocus]);

  const updatePremiumUsage = (
    modelUsed?: string,
    premiumImprovementsUsedToday?: number
  ) => {
    if (typeof premiumImprovementsUsedToday === 'number') {
      setPremiumUsedToday(premiumImprovementsUsedToday);
      return;
    }
    if (isPremiumModel(modelUsed)) {
      incrementPremiumUsed();
    }
  };

  const requestImprovement = async () => {
    const textForImprovement = trimmedAiSource || content;
    const normalizedText = textForImprovement.trim();

    if (!normalizedText || normalizedText.length < 20) {
      toast.error('Agrega más contenido antes de mejorar con IA');
      return;
    }
    if (trimmedAiSource && aiImprovementLength > aiImprovementLimit) {
      toast.error(
        improvementFieldError ?? 'Has superado el límite para mejorar con IA'
      );
      return;
    }
    if (!trimmedAiSource && normalizedText.length > aiImprovementLimit) {
      toast.error(
        'Este prompt es demasiado largo para mejorarlo de una vez. Usa el campo Texto a mejorar para trabajar por partes.'
      );
      return;
    }
    setLoading(true);
    setSourceContent(normalizedText);
    try {
      const response = await fetch('/api/ai-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: normalizedText,
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
      updatePremiumUsage(data.modelUsed, data.premiumImprovementsUsedToday);
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

  const handleRegenerate = () => {
    setDiffOpen(false);
    void requestImprovement();
  };

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-300">
          Ayuda con IA
        </p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Mejorar este prompt
        </h3>
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
        <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          {premiumInfoMessage}
        </p>
      </div>
      <div className="mt-4 space-y-3">
        <label className="space-y-2 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                Texto a mejorar (opcional)
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Si tu prompt completo es muy largo, pega aquí solo la parte que
                quieras que la IA mejore.
              </p>
            </div>
            <span
              className={clsx('text-[11px] font-mono', {
                'text-rose-500': aiImprovementOverLimit,
                'text-slate-400': !aiImprovementOverLimit
              })}
            >
              {aiImprovementLength} / {aiImprovementLimit}
            </span>
          </div>
          <textarea
            value={aiImprovementSource}
            onChange={(event) =>
              onChangeAiImprovementSource(event.target.value)
            }
            placeholder="Pega aquí solo el fragmento que quieras mejorar"
            rows={4}
            maxLength={aiImprovementLimit}
            className={clsx(
              'w-full min-h-[96px] resize-y rounded-2xl border px-4 py-2 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400',
              improvementFieldError
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-200 focus:border-primary focus:ring-primary dark:border-slate-700'
            )}
          />
          {improvementFieldError && (
            <p className="text-xs text-rose-500">{improvementFieldError}</p>
          )}
          {cannotImproveWithFullPrompt && (
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Este prompt es demasiado largo para mejorarlo de una vez. Usa el
              campo Texto a mejorar para trabajar por partes.
            </p>
          )}
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            ¿Cómo quieres que la IA mejore este prompt?
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Opcional. Ejemplos: hazlo más conciso, más estructurado, añade
            ejemplos, etc.
          </p>
          <textarea
            ref={goalInputRef}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="Hazlo más claro y accionable"
            rows={3}
            className="w-full min-h-[90px] resize-y rounded-2xl border border-slate-200 px-4 py-2 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
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
                    : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200'
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
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-primary dark:border-slate-700 dark:text-slate-200"
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
        <Button
          type="button"
          onClick={requestImprovement}
          loading={loading}
          disabled={disableGenerate}
          className="w-full"
        >
          Generar mejora
        </Button>
        {result && (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/70">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
              <span>Versión propuesta</span>
              {result.modelUsed && (
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    isPremiumModel(result.modelUsed)
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'
                  )}
                >
                  {isPremiumModel(result.modelUsed) ? 'Premium' : 'Free'}
                </span>
              )}
            </div>
            <pre className="min-h-[240px] max-h-[420px] overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words rounded-2xl border border-slate-100 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100">
              {result.improved_prompt}
            </pre>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setDiffOpen(true)}
                className="min-w-[140px]"
              >
                Ver diff y aplicar…
              </Button>
              <CopyProposalButton text={result.improved_prompt} />
              <button
                type="button"
                onClick={requestImprovement}
                disabled={loading}
                className={clsx(
                  'text-xs font-semibold underline-offset-2 transition-colors',
                  loading
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-primary hover:underline'
                )}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-3 w-3 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="sr-only">Generando propuesta</span>
                    Generando...
                  </span>
                ) : (
                  'Generar otra propuesta'
                )}
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
