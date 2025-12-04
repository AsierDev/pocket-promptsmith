import type { UseFormRegister, FieldErrors } from 'react-hook-form';

import { Button } from '@/components/common/Button';
import { FormField } from '@/components/common/FormField';
import { PROMPT_CATEGORIES } from '@/features/prompts/schemas';
import type { PromptFormValues } from '@/features/prompts/schemas';

interface WizardStep1Props {
  register: UseFormRegister<PromptFormValues>;
  errors: FieldErrors<PromptFormValues>;
  onNext: () => void;
  onCancel: () => void;
  isNavigating?: boolean;
}

export function WizardStep1({
  register,
  errors,
  onNext,
  onCancel,
  isNavigating = false
}: WizardStep1Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card-subtle dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
          Información Básica
        </h2>

        <div className="space-y-4">
          <FormField
            label="Título *"
            htmlFor="title"
            error={errors.title?.message}
          >
            <input
              id="title"
              type="text"
              {...register('title')}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              placeholder="Ej: Generador de ideas de negocio para developers"
            />
          </FormField>

          <FormField
            label="Categoría *"
            htmlFor="category"
            error={errors.category?.message}
          >
            <select
              id="category"
              {...register('category')}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:text-sm"
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
              rows={4}
              maxLength={260}
              className="w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm leading-comfortable text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          className="rounded-full border border-slate-200 bg-white px-6 font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onNext}
          loading={isNavigating}
          disabled={isNavigating}
          className="w-full rounded-full bg-primary px-8 text-white hover:bg-violet-600 sm:w-auto"
        >
          Siguiente →
        </Button>
      </div>
    </div>
  );
}
