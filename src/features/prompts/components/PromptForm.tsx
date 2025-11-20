'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { promptFormSchema, PROMPT_CATEGORIES, PromptFormValues } from '@/features/prompts/schemas';
import { Button } from '@/components/common/Button';
import { FormField } from '@/components/common/FormField';
import { TagInput } from './TagInput';
import { createPromptAction, updatePromptAction } from '@/features/prompts/actions';
import { PromptAIHelperPanel } from './PromptAIHelperPanel';

interface PromptFormProps {
  defaultValues?: Partial<PromptFormValues> & { id?: string };
  mode: 'create' | 'edit';
  disableSubmit?: boolean;
  improveDisabledCopy?: string;
  cancelHref?: string;
  autoFocusAiPanel?: boolean;
}

const quickTags = ['Código', 'Educación', 'Marketing', 'UX', 'Ventas', 'Producto'];

export const PromptForm = ({
  defaultValues,
  mode,
  disableSubmit,
  improveDisabledCopy,
  cancelHref = '/prompts',
  autoFocusAiPanel
}: PromptFormProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [promptGoal, setPromptGoal] = useState('');
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
      content: '',
      category: 'Escritura',
      tags: [],
      thumbnail_url: ''
    }
  });

  useEffect(() => {
    if (defaultValues?.content) {
      const firstLine = defaultValues.content.split('\n').find((line) => line.trim());
      setPromptGoal(firstLine ?? '');
    }
  }, [defaultValues?.content]);

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
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Información básica</p>
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
                htmlFor="prompt_goal"
                description="Describe en una frase lo que quieres lograr (referencia rápida)"
              >
                <input
                  id="prompt_goal"
                  type="text"
                  value={promptGoal}
                  onChange={(event) => setPromptGoal(event.target.value)}
                  placeholder="Generar ideas de negocio para developers..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700"
                />
              </FormField>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contenido</p>
              <span className="text-xs text-slate-400">{charCount} caracteres</span>
            </div>
            <FormField
              label="Instrucciones completas"
              htmlFor="content"
              description="Usa variables como {{nombre}} o {{industria}} para personalizar luego."
              error={errors.content?.message}
            >
              <textarea
                id="content"
                {...register('content')}
                rows={12}
                className="w-full rounded-3xl border border-slate-200 px-4 py-3 font-mono text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700"
                placeholder="Actúa como..."
              />
            </FormField>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Organización</p>
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
          disabledCopy={improveDisabledCopy}
          onApply={handleApplyImprovement}
          autoFocus={autoFocusAiPanel}
        />
      </div>
    </form>
  );
};
