import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/common/Button';
import { PromptAIHelperPanel } from '@/features/prompts/components/PromptAIHelperPanel';
import {
    PROMPT_CONTENT_MAX_LENGTH,
    AI_IMPROVEMENT_SOURCE_MAX_LENGTH,
    PROMPT_CATEGORIES
} from '@/features/prompts/schemas';
import type { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import type { PromptFormValues } from '@/features/prompts/schemas';
import clsx from 'clsx';
import { useState } from 'react';
import { useCharacterLimitValidation } from '@/hooks/useCharacterLimitValidation';

interface WizardStep2Props {
    register: UseFormRegister<PromptFormValues>;
    errors: FieldErrors<PromptFormValues>;
    contentValue: string;
    categoryValue: typeof PROMPT_CATEGORIES[number];
    aiImprovementSource: string;
    onApplyImprovement: (value: string) => void;
    setValue: UseFormSetValue<PromptFormValues>;
    autoFocusAiPanel?: boolean;
    mode: 'create' | 'edit';
    promptId?: string;
    onNext: () => void;
    onBack: () => void;
}

export function WizardStep2({
    register,
    errors,
    contentValue,
    categoryValue,
    aiImprovementSource,
    onApplyImprovement,
    setValue,
    autoFocusAiPanel,
    mode,
    promptId,
    onNext,
    onBack
}: WizardStep2Props) {
    const [showAiHelper, setShowAiHelper] = useState(false);
    const { charCount, isApproachingLimit, isOverLimit, contentError } = useCharacterLimitValidation({
        content: contentValue,
        maxLength: PROMPT_CONTENT_MAX_LENGTH,
        existingError: errors.content?.message
    });

    return (
        <div className="space-y-6">
            {/* Main content area - desktop: split view, mobile: stacked */}
            <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
                {/* Left: Content editor */}
                <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card-subtle dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-3">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contenido del Prompt</h2>
                        </div>
                        <div className="mb-2">
                            <span
                                className={clsx('text-xs font-medium', {
                                    'text-rose-500': isOverLimit,
                                    'text-amber-500': !isOverLimit && isApproachingLimit,
                                    'text-slate-400 dark:text-slate-500': !isApproachingLimit && !isOverLimit
                                })}
                            >
                                {charCount} / {PROMPT_CONTENT_MAX_LENGTH}
                            </span>
                        </div>

                        <FormField
                            label="Instrucciones completas *"
                            htmlFor="content"
                            description="Usa variables como {{nombre}} o {{industria}} para personalizar después."
                            error={contentError}
                        >
                            <textarea
                                id="content"
                                {...register('content')}
                                rows={14}
                                maxLength={PROMPT_CONTENT_MAX_LENGTH}
                                className={clsx(
                                    'w-full rounded-3xl border bg-white px-4 py-3 font-mono text-sm leading-comfortable text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500',
                                    isOverLimit
                                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                                        : 'border-slate-300 focus:border-primary focus:ring-primary/20 dark:border-slate-700'
                                )}
                                placeholder="Actúa como..."
                            />
                        </FormField>
                    </div>

                    {/* Mobile AI Helper toggle */}
                    <div className="lg:hidden">
                        <button
                            type="button"
                            onClick={() => setShowAiHelper(!showAiHelper)}
                            className="flex w-full items-center justify-between rounded-2xl border border-primary bg-primary px-4 py-3 text-left shadow-sm transition hover:bg-violet-700 dark:border-violet-600 dark:bg-violet-700 dark:hover:bg-violet-600"
                        >
                            <div className="flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-5 w-5 text-white"
                                >
                                    <path d="M16.5 7.5h-9v9h9v-9z" />
                                    <path
                                        fillRule="evenodd"
                                        d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="font-bold text-white">
                                    {showAiHelper ? 'Ocultar' : 'Mostrar'} Ayuda con IA
                                </span>
                            </div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className={clsx('h-5 w-5 text-white transition-transform', {
                                    'rotate-180': showAiHelper
                                })}
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                        {showAiHelper && (
                            <div className="mt-4">
                                <PromptAIHelperPanel
                                    mode={mode}
                                    promptId={promptId}
                                    content={contentValue}
                                    category={categoryValue}
                                    onApply={onApplyImprovement}
                                    autoFocus={autoFocusAiPanel}
                                    aiImprovementSource={aiImprovementSource}
                                    onChangeAiImprovementSource={(val) =>
                                        setValue('ai_improvement_source', val, { shouldDirty: true, shouldValidate: true })
                                    }
                                    aiImprovementLimit={AI_IMPROVEMENT_SOURCE_MAX_LENGTH}
                                    aiImprovementError={errors.ai_improvement_source?.message}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: AI Helper Panel (desktop always visible) */}
                <div className="hidden lg:block">
                    <PromptAIHelperPanel
                        mode={mode}
                        promptId={promptId}
                        content={contentValue ?? ''}
                        category={categoryValue}
                        onApply={onApplyImprovement}
                        autoFocus={autoFocusAiPanel}
                        aiImprovementSource={aiImprovementSource ?? ''}
                        onChangeAiImprovementSource={(value) =>
                            setValue('ai_improvement_source', value, { shouldDirty: true, shouldValidate: true })
                        }
                        aiImprovementLimit={AI_IMPROVEMENT_SOURCE_MAX_LENGTH}
                        aiImprovementError={errors.ai_improvement_source?.message}
                    />
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
                <Button
                    type="button"
                    onClick={onBack}
                    variant="ghost"
                    className="rounded-full border border-slate-200 bg-white px-6 font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                    ← Atrás
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    className="w-full rounded-full bg-primary px-8 text-white hover:bg-violet-600 sm:w-auto"
                >
                    Siguiente →
                </Button>
            </div>
        </div>
    );
}
