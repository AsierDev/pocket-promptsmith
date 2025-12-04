'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/common/Button';
import { trackPromptUsage } from '@/features/prompts/actions';
import { FavoriteToggle } from '@/features/prompts/components/FavoriteToggle';
import { extractVariables, replaceVariables } from '@/features/variables/extractVariables';
import { hasIncompleteVariables } from '@/features/variables/utils';
import type { PromptRow } from '@/types/supabase';

interface Props {
  prompt: PromptRow;
  closeHref: Route;
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

  const hasMissing = hasIncompleteVariables(variables, values);

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
    <div className="flex h-full flex-col text-slate-900 dark:text-slate-100">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200/70 pb-4 dark:border-slate-800">
        <div>
          <p
            id="use-prompt-title"
            className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-300"
          >
            Usar prompt
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{prompt.title}</h1>
          <p id="use-prompt-description" className="text-sm text-slate-700 dark:text-slate-200">
            Completa variables, revisa y copia con un clic.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteToggle promptId={prompt.id} initialFavorite={prompt.is_favorite} />
          <Link
            href={closeHref}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white"
          >
            ✕
          </Link>
        </div>
      </header>
      <div className="flex-1 space-y-6 overflow-y-auto py-6">
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-50">Completa variables</h2>
            {variables.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-300">La vista previa se actualiza automáticamente mientras escribes.</p>
            )}
          </div>
          {variables.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
              Este prompt no tiene variables. Puedes copiarlo directamente.
            </p>
          ) : (
            <form className="space-y-3" aria-live="polite">
              {variables.map((variable) => (
                <label key={variable} className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {variable}
                  <input
                    type="text"
                    {...form.register(variable, { required: true })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder={`Valor para ${variable}`}
                  />
                </label>
              ))}
            </form>
          )}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Prompt listo para usar</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {debouncedPreview.length} caracteres · {debouncedPreview.split('\n').length} líneas
            </span>
          </div>
          <textarea
            value={debouncedPreview}
            readOnly
            className="h-80 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-comfortable text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-50"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowX: 'hidden' }}
          />
        </section>
      </div>
      <footer className="border-t border-slate-200/70 pt-4 dark:border-slate-800">
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => handleCopy(debouncedPreview)}
            disabled={hasMissing && variables.length > 0}
            className="w-full rounded-full bg-primary px-6 py-2.5 font-semibold text-white hover:bg-violet-600"
          >
            Copiar prompt completo
          </Button>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">El prompt incluye todas tus variables y mejoras aplicadas</p>
          <button
            type="button"
            onClick={() => handleCopy(prompt.content)}
            className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-primary hover:underline dark:text-slate-300 dark:hover:text-primary"
          >
            Copiar solo instrucciones originales
          </button>
          <button type="button" className="text-xs text-slate-400 underline-offset-4 hover:text-primary hover:underline">
            Ver historial de mejoras (próximamente)
          </button>
        </div>
      </footer>
    </div>
  );
};
