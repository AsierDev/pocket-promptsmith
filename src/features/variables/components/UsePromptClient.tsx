'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { extractVariables, replaceVariables } from '@/features/variables/extractVariables';
import type { PromptRow } from '@/types/supabase';
import { Button } from '@/components/common/Button';
import { trackPromptUsage } from '@/features/prompts/actions';
import { toast } from 'sonner';

interface Props {
  prompt: PromptRow;
}

type VariableForm = Record<string, string>;

export const UsePromptClient = ({ prompt }: Props) => {
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
    const timer = setTimeout(() => setDebouncedPreview(preview), 300);
    return () => clearTimeout(timer);
  }, [preview]);

  const hasMissing = variables.some((variable) => !values[variable]);

  const handleCopy = async () => {
    if (hasMissing) {
      toast.error('Completa todas las variables antes de copiar');
      return;
    }
    try {
      await navigator.clipboard.writeText(debouncedPreview);
      toast.success('¡Copiado!');
      await trackPromptUsage(prompt.id);
    } catch (error) {
      toast.error('No se pudo copiar');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form className="space-y-4" aria-live="polite">
        {variables.length === 0 ? (
          <p className="text-sm text-slate-500">Este prompt no tiene variables. Puedes copiarlo directamente.</p>
        ) : (
          variables.map((variable) => (
            <label key={variable} className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              {variable}
              <input
                type="text"
                {...form.register(variable, { required: true })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
                placeholder={`Valor para ${variable}`}
              />
            </label>
          ))
        )}
        <Button type="button" onClick={handleCopy} disabled={hasMissing && variables.length > 0}>
          Copy to Clipboard
        </Button>
      </form>
      <div>
        <p className="text-xs uppercase text-slate-400">Preview</p>
        <pre className="mt-2 max-h-[480px] overflow-auto rounded-3xl bg-slate-100 p-4 text-sm leading-relaxed dark:bg-slate-800">
          {debouncedPreview}
        </pre>
      </div>
    </div>
  );
};
