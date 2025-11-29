import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/common/Button';
import { TagInput } from './TagInput';
import { Controller } from 'react-hook-form';
import type { Control, UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import type { PromptFormValues } from '@/features/prompts/schemas';

interface WizardStep3Props {
    control: Control<PromptFormValues>;
    register: UseFormRegister<PromptFormValues>;
    errors: FieldErrors<PromptFormValues>;
    tagsValue: string[];
    setValue: UseFormSetValue<PromptFormValues>;
    onBack: () => void;
    onSubmit: () => void;
    pending: boolean;
    disableSubmit?: boolean;
    mode: 'create' | 'edit';
}

const quickTags = ['Código', 'Educación', 'Marketing', 'UX', 'Ventas', 'Producto'];

export function WizardStep3({
    control,
    register,
    errors,
    tagsValue,
    setValue,
    onBack,
    onSubmit,
    pending,
    disableSubmit,
    mode
}: WizardStep3Props) {
    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Opciones Avanzadas</h2>

                <div className="space-y-5">
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
                                <TagInput
                                    value={field.value ?? []}
                                    onChange={field.onChange}
                                    placeholder="Ej: marketing, ux"
                                />
                            </FormField>
                        )}
                    />

                    <div className="flex flex-wrap gap-2">
                        <p className="w-full text-xs text-slate-500 dark:text-slate-400">Sugerencias rápidas:</p>
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
                                    className={`rounded-full border px-3 py-1 text-xs transition ${isActive
                                        ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                                        : 'border-slate-200 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary dark:hover:text-primary'
                                        }`}
                                >
                                    #{tag}
                                </button>
                            );
                        })}
                    </div>

                    <FormField
                        label="Imagen o recurso (opcional)"
                        htmlFor="thumbnail_url"
                        description="URL de una imagen de referencia o recurso relacionado."
                        error={errors.thumbnail_url?.message}
                    >
                        <input
                            id="thumbnail_url"
                            type="url"
                            placeholder="https://"
                            {...register('thumbnail_url')}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                        />
                    </FormField>
                </div>
            </div>

            {/* Help card */}
            <div className="rounded-2xl border border-violet-600 bg-violet-600 p-5 shadow-sm dark:border-violet-500 dark:bg-violet-900/50">
                <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                        >
                            <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">
                            ✨ Consejo
                        </p>
                        <p className="mt-1 text-sm font-medium text-violet-100">
                            Los tags te ayudan a organizar y encontrar tus prompts rápidamente.
                            La URL de imagen es opcional pero útil como referencia visual.
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
                <Button
                    type="button"
                    onClick={onBack}
                    variant="ghost"
                    className="rounded-full bg-slate-100 px-6 font-medium text-slate-900 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                    ← Atrás
                </Button>
                <Button
                    type="submit"
                    onClick={onSubmit}
                    loading={pending}
                    disabled={disableSubmit}
                    className="rounded-full bg-primary px-8 text-white hover:bg-violet-600"
                >
                    {mode === 'edit' ? '💾 Guardar cambios' : '💾 Guardar prompt'}
                </Button>
            </div>
        </div>
    );
}
