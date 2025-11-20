'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import clsx from 'clsx';
import type { Route } from 'next';
import {
  promptFormSchema,
  PROMPT_CATEGORIES,
  PromptFormValues,
  PROMPT_CONTENT_MAX_LENGTH
} from '@/features/prompts/schemas';
import { Button } from '@/components/common/Button';
import { FormField } from '@/components/common/FormField';
import { TagInput } from './TagInput';
import { createPromptAction, updatePromptAction } from '@/features/prompts/actions';
import { PromptAIHelperPanel } from './PromptAIHelperPanel';

interface PromptFormProps {
  defaultValues?: Partial<PromptFormValues> & { id?: string };
  mode: 'create' | 'edit';
  disableSubmit?: boolean;
  cancelHref?: Route;
  autoFocusAiPanel?: boolean;
  premiumImprovementsUsedToday?: number;
}

const quickTags = ['Código', 'Educación', 'Marketing', 'UX', 'Ventas', 'Producto'];

export const PromptForm = ({
  defaultValues,
  mode,
  disableSubmit,
  cancelHref = '/prompts',
  autoFocusAiPanel,
  premiumImprovementsUsedToday
}: PromptFormProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: defaultValues ?? {
      title: '',
      summary: '',
      content: '',
      category: 'Escritura',
      tags: [],
      thumbnail_url: ''
    }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const contentValue = watch('content');
  const categoryValue = watch('category');
  const tagsValue = watch('tags') ?? [];

  const submitHandler = handleSubmit((values) => {
    if (disableSubmit) {
      toast.error('Has alcanzado el límite de prompts en el plan gratuito');
      return;
    }
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('summary', values.summary ?? '');
    formData.append('content', values.content);
    formData.append('category', values.category);
    formData.append('thumbnail_url', values.thumbnail_url ?? '');
    formData.append('tags', JSON.stringify(values.tags ?? []));

    startTransition(async () => {
      try {
        if (mode === 'edit' && defaultValues?.id) {
          await updatePromptAction(defaultValues.id, formData);
          toast.success('Prompt actualizado');
        } else {
          await createPromptAction(formData);
          toast.success('Prompt creado');
          reset();
        }
        router.refresh();
        if (mode === 'create') {
          router.push('/prompts');
        }
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  });

  const handleApplyImprovement = (value: string) => {
    setValue('content', value, { shouldDirty: true, shouldValidate: true });
  };

  const charCount = contentValue?.length ?? 0;
  const isApproachingLimit = charCount >= PROMPT_CONTENT_MAX_LENGTH * 0.9 && charCount <= PROMPT_CONTENT_MAX_LENGTH;
  const isOverLimit = charCount > PROMPT_CONTENT_MAX_LENGTH;
  const contentError = isOverLimit
    ? `Has superado el límite de ${PROMPT_CONTENT_MAX_LENGTH} caracteres. Simplifica el prompt o divídelo en varios.`
    : errors.content?.message;

  return (
    <form onSubmit={submitHandler} className="space-y-6" aria-live="polite">
      {disableSubmit && (
        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Has alcanzado el límite de prompts del plan Free. Borra alguno o espera a Pro.
        </p>
      )}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),320px]">
        <div className="space-y-8">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-300">Información básica</p>
            <div className="mt-4 space-y-4">
              <FormField label="Título" htmlFor="title" error={errors.title?.message}>
                <input
                  id="title"
                  type="text"
                  {...register('title')}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700"
                  placeholder="Prompt para brainstorming creativo"
                />
              </FormField>
              <FormField label="Categoría" htmlFor="category" error={errors.category?.message}>
                <select
                  id="category"
                  {...register('category')}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 dark:border-slate-700"
                >
                  {PROMPT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label="Objetivo del prompt"
                htmlFor="summary"
                description="Describe en pocas frases el propósito para tenerlo siempre a la vista."
                error={errors.summary?.message}
              >
                <textarea
                  id="summary"
                  {...register('summary')}
                  placeholder="Generar ideas de negocio para developers..."
                  rows={3}
                  maxLength={260}
                  className="w-full min-h-[96px] resize-y rounded-2xl border border-slate-200 px-4 py-2 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700"
                />
              </FormField>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-300">Contenido</p>
              <span
                className={clsx('text-xs font-medium', {
                  'text-rose-500': isOverLimit,
                  'text-amber-500': !isOverLimit && isApproachingLimit,
                  'text-slate-400': !isApproachingLimit && !isOverLimit
                })}
              >
                {charCount} / {PROMPT_CONTENT_MAX_LENGTH}
              </span>
            </div>
            <FormField
              label="Instrucciones completas"
              htmlFor="content"
              description="Usa variables como {{nombre}} o {{industria}} para personalizar luego."
              error={contentError}
            >
              <textarea
                id="content"
                {...register('content')}
                rows={12}
                maxLength={PROMPT_CONTENT_MAX_LENGTH}
                className={clsx(
                  'w-full rounded-3xl border px-4 py-3 font-mono text-sm leading-relaxed focus:outline-none focus:ring-1',
                  isOverLimit
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-primary focus:ring-primary dark:border-slate-700'
                )}
                placeholder="Actúa como..."
              />
            </FormField>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-300">Organización</p>
            <div className="mt-4 space-y-4">
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <FormField
                    label="Tags"
                    htmlFor="tags"
                    description="Presiona Enter para agregar. Máximo 8."
                    error={errors.tags?.message}
                  >
                    <TagInput value={field.value ?? []} onChange={field.onChange} placeholder="Ej: marketing, ux" />
                  </FormField>
                )}
              />
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {quickTags.map((tag) => {
                  const normalized = tag.toLowerCase();
                  const isActive = tagsValue.includes(normalized);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => {
                        if (isActive) return;
                        const next = [...tagsValue, normalized];
                        setValue('tags', next, { shouldDirty: true });
                      }}
                      className={`rounded-full border px-3 py-1 transition ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 hover:border-primary hover:text-primary dark:border-slate-700'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
              <FormField
                label="Imagen o recurso opcional"
                htmlFor="thumbnail_url"
                description="Si usas una portada o enlace de referencia, agrégalo aquí."
                error={errors.thumbnail_url?.message}
              >
                <input
                  id="thumbnail_url"
                  type="url"
                  placeholder="https://"
                  {...register('thumbnail_url')}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700"
                />
              </FormField>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href={cancelHref}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700"
            >
              {mode === 'edit' ? 'Cerrar' : 'Cancelar'}
            </Link>
            <Button type="submit" loading={pending} disabled={disableSubmit} className="rounded-full px-6">
              {mode === 'edit' ? 'Guardar cambios' : 'Guardar prompt'}
            </Button>
          </div>
        </div>

        <PromptAIHelperPanel
          mode={mode}
          promptId={defaultValues?.id}
          content={contentValue ?? ''}
          category={categoryValue ?? 'Escritura'}
          onApply={handleApplyImprovement}
          autoFocus={autoFocusAiPanel}
          initialPremiumUsed={premiumImprovementsUsedToday ?? 0}
        />
      </div>
    </form>
  );
};
