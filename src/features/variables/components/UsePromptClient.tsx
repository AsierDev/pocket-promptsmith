'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { extractVariables, replaceVariables } from '@/features/variables/extractVariables';
import type { PromptRow } from '@/types/supabase';
import { Button } from '@/components/common/Button';
import { trackPromptUsage } from '@/features/prompts/actions';
import { toast } from 'sonner';
import { FavoriteToggle } from '@/features/prompts/components/FavoriteToggle';

interface Props {
  prompt: PromptRow;
  closeHref: string;
}

type VariableForm = Record<string, string>;

export const UsePromptClient = ({ prompt, closeHref }: Props) => {
  const variables = useMemo(() => extractVariables(prompt.content), [prompt.content]);
  const form = useForm<VariableForm>({
    defaultValues: variables.reduce<VariableForm>((acc, variable) => ({ ...acc, [variable]: '' }), {})
  });
  // React Hook Form's watch helper is required to render live previews; suppress compiler warning.
  // eslint-disable-next-line react-hooks/incompatible-library
  const values = form.watch();
  const preview = useMemo(() => replaceVariables(prompt.content, values), [prompt.content, values]);
  const [debouncedPreview, setDebouncedPreview] = useState(preview);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPreview(preview), 250);
    return () => clearTimeout(timer);
  }, [preview]);

  const hasMissing = variables.some((variable) => !values[variable]);

  const handleApplyValues = () => {
    setDebouncedPreview(preview);
    toast.success('Vista actualizada con tus variables');
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('¡Copiado!');
      await trackPromptUsage(prompt.id);
    } catch (error) {
      toast.error('No se pudo copiar');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs uppercase text-slate-400">Usar prompt</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{prompt.title}</h1>
          <p className="text-sm text-slate-500">Completa variables, revisa y copia con un clic.</p>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteToggle promptId={prompt.id} initialFavorite={prompt.is_favorite} />
          <Link
            href={closeHref}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            ✕
          </Link>
        </div>
      </header>
      <div className="flex-1 space-y-6 overflow-y-auto py-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Completa variables</h2>
            {variables.length > 0 && (
              <Button type="button" variant="secondary" onClick={handleApplyValues}>
                Actualizar vista
              </Button>
            )}
          </div>
          {variables.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
              Este prompt no tiene variables. Puedes copiarlo directamente.
            </p>
          ) : (
            <form className="space-y-3" aria-live="polite">
              {variables.map((variable) => (
                <label key={variable} className="space-y-1 text-sm font-medium text-slate-700">
                  {variable}
                  <input
                    type="text"
                    {...form.register(variable, { required: true })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder={`Valor para ${variable}`}
                  />
                </label>
              ))}
            </form>
          )}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Prompt listo para usar</h2>
            <span className="text-xs text-slate-400">
              {debouncedPreview.length} caracteres · {debouncedPreview.split('\n').length} líneas
            </span>
          </div>
          <pre className="max-h-[360px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed dark:border-slate-800 dark:bg-slate-900/50">
            {debouncedPreview}
          </pre>
        </section>
      </div>
      <footer className="border-t border-slate-200 pt-4">
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => handleCopy(debouncedPreview)}
            disabled={hasMissing && variables.length > 0}
            className="w-full"
          >
            Copiar prompt completo
          </Button>
          <button
            type="button"
            onClick={() => handleCopy(prompt.content)}
            className="text-sm font-semibold text-slate-500 underline-offset-4 hover:text-primary hover:underline"
          >
            Copiar solo el contenido original
          </button>
          <button type="button" className="text-xs text-slate-400 underline-offset-4 hover:text-primary hover:underline">
            Ver historial de mejoras (próximamente)
          </button>
        </div>
      </footer>
    </div>
  );
};
