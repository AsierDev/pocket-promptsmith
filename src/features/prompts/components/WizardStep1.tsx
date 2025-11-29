import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/common/Button';
import { PROMPT_CATEGORIES } from '@/features/prompts/schemas';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { PromptFormValues } from '@/features/prompts/schemas';

interface WizardStep1Props {
    register: UseFormRegister<PromptFormValues>;
    errors: FieldErrors<PromptFormValues>;
    onNext: () => void;
    onCancel: () => void;
}

export function WizardStep1({ register, errors, onNext, onCancel }: WizardStep1Props) {
    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Información Básica</h2>

                <div className="space-y-4">
                    <FormField label="Título *" htmlFor="title" error={errors.title?.message}>
                        <input
                            id="title"
                            type="text"
                            {...register('title')}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                            placeholder="Ej: Generador de ideas de negocio para developers"
                        />
                    </FormField>

                    <FormField label="Categoría *" htmlFor="category" error={errors.category?.message}>
                        <select
                            id="category"
                            {...register('category')}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            {PROMPT_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField
                        label="Objetivo del prompt (opcional)"
                        htmlFor="summary"
                        description="Describe brevemente para qué sirve este prompt."
                        error={errors.summary?.message}
                    >
                        <textarea
                            id="summary"
                            {...register('summary')}
                            placeholder="Ej: Sugerir ideas de negocio para developers basadas en sus habilidades..."
                            rows={3}
                            maxLength={260}
                            className="w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                        />
                    </FormField>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3">
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="ghost"
                    className="rounded-full bg-slate-100 px-6 font-medium text-slate-900 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                    Cancelar
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    className="rounded-full bg-primary px-8 text-white hover:bg-violet-600"
                >
                    Siguiente →
                </Button>
            </div>
        </div>
    );
}
