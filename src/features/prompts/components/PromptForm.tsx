'use client';

import { useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { promptFormSchema, PROMPT_CATEGORIES, PromptFormValues } from '@/features/prompts/schemas';
import { Button } from '@/components/common/Button';
import { FormField } from '@/components/common/FormField';
import { TagInput } from './TagInput';
import { createPromptAction, updatePromptAction } from '@/features/prompts/actions';

interface PromptFormProps {
  defaultValues?: Partial<PromptFormValues> & { id?: string };
  mode: 'create' | 'edit';
  disableSubmit?: boolean;
  onImprove?: () => void;
  improveDisabledCopy?: string;
  registerContentUpdater?: (cb: (value: string) => void) => void;
  onContentChange?: (content: string) => void;
}

export const PromptForm = ({
  defaultValues,
  mode,
  disableSubmit,
  onImprove,
  improveDisabledCopy,
  registerContentUpdater,
  onContentChange
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
      content: '',
      category: 'Escritura',
      tags: [],
      thumbnail_url: ''
    }
  });

  useEffect(() => {
    if (!registerContentUpdater) return;
    registerContentUpdater((value: string) => {
      setValue('content', value, { shouldDirty: true, shouldValidate: true });
    });
  }, [registerContentUpdater, setValue]);

  const contentValue = watch('content');

  useEffect(() => {
    if (onContentChange) {
      onContentChange(contentValue);
    }
  }, [contentValue, onContentChange]);

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

  return (
    <form onSubmit={submitHandler} className="space-y-6" aria-live="polite">
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
        label="Contenido"
        htmlFor="content"
        description="Usa variables como {{audiencia}} para personalizar luego"
        error={errors.content?.message}
      >
        <textarea
          id="content"
          {...register('content')}
          rows={10}
          className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700"
          placeholder="Actúa como..."
        />
      </FormField>

      <Controller
        control={control}
        name="tags"
        render={({ field }) => (
          <FormField label="Tags" htmlFor="tags" description="Presiona Enter para guardar" error={errors.tags?.message}>
            <TagInput value={field.value ?? []} onChange={field.onChange} placeholder="Ej: marketing, ux" />
          </FormField>
        )}
      />

      <FormField label="Imagen opcional" htmlFor="thumbnail_url" error={errors.thumbnail_url?.message}>
        <input
          id="thumbnail_url"
          type="url"
          placeholder="https://"
          {...register('thumbnail_url')}
          className="w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700"
        />
      </FormField>

      {mode === 'edit' && onImprove && (
        <div className="rounded-2xl border border-dashed border-violet-300 p-4 text-sm dark:border-violet-600">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="font-medium text-slate-700 dark:text-slate-200">Mejoras con IA</p>
            <Button type="button" onClick={onImprove} disabled={Boolean(improveDisabledCopy)}>
              Improve with AI
            </Button>
          </div>
          {improveDisabledCopy && <p className="text-xs text-slate-500">{improveDisabledCopy}</p>}
        </div>
      )}

      <Button type="submit" loading={pending} disabled={disableSubmit} className="w-full">
        {mode === 'edit' ? 'Guardar cambios' : 'Guardar prompt'}
      </Button>
    </form>
  );
};
