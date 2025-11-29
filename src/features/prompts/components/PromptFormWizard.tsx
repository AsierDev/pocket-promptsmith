'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Route } from 'next';
import {
    promptFormSchema,
    PROMPT_CATEGORIES,
    PromptFormValues
} from '@/features/prompts/schemas';
import { createPromptAction, updatePromptAction } from '@/features/prompts/actions';
import { PromptWizard, WizardStep } from './PromptWizard';
import { WizardStep1 } from './WizardStep1';
import { WizardStep2 } from './WizardStep2';
import { WizardStep3 } from './WizardStep3';

interface PromptFormWizardProps {
    defaultValues?: Partial<PromptFormValues> & { id?: string };
    mode: 'create' | 'edit';
    disableSubmit?: boolean;
    cancelHref?: Route;
    autoFocusAiPanel?: boolean;
}

const wizardSteps: WizardStep[] = [
    {
        id: 'basic',
        label: 'Info Básica',
        description: 'Título y categoría'
    },
    {
        id: 'content',
        label: 'Contenido',
        description: 'Tu prompt'
    },
    {
        id: 'advanced',
        label: 'Opciones',
        description: 'Tags y extras'
    }
];

export const PromptFormWizard = ({
    defaultValues,
    mode,
    disableSubmit,
    cancelHref = '/prompts/dashboard',
    autoFocusAiPanel
}: PromptFormWizardProps) => {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [currentStep, setCurrentStep] = useState(0);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        trigger
    } = useForm<PromptFormValues>({
        resolver: zodResolver(promptFormSchema),
        mode: 'onChange',
        defaultValues: {
            title: '',
            summary: '',
            content: '',
            category: 'Escritura',
            tags: [],
            thumbnail_url: '',
            ai_improvement_source: '',
            ...(defaultValues ?? {})
        }
    });

    const contentValue = useWatch({ control, name: 'content' });
    const aiImprovementSource = useWatch({ control, name: 'ai_improvement_source' });
    const categoryValue = useWatch({ control, name: 'category' });
    const tagsValue = useWatch({ control, name: 'tags' }) ?? [];

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
        formData.append('ai_improvement_source', values.ai_improvement_source ?? '');

        startTransition(async () => {
            try {
                if (mode === 'edit' && defaultValues?.id) {
                    await updatePromptAction(defaultValues.id, formData);
                    toast.success('Prompt actualizado');
                } else {
                    await createPromptAction(formData);
                    toast.success('Prompt creado');
                }
                router.refresh();
                router.push('/prompts/dashboard');
            } catch (error) {
                toast.error((error as Error).message);
            }
        });
    });

    const handleNext = async () => {
        let fieldsToValidate: (keyof PromptFormValues)[] = [];

        if (currentStep === 0) {
            fieldsToValidate = ['title', 'category', 'summary'];
        } else if (currentStep === 1) {
            fieldsToValidate = ['content'];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, wizardSteps.length - 1));
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleApplyImprovement = (value: string) => {
        setValue('content', value, { shouldDirty: true, shouldValidate: true });
    };

    return (
        <form onSubmit={submitHandler} className="space-y-6">
            {disableSubmit && (
                <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Has alcanzado el límite de prompts del plan Free. Borra alguno o espera a Pro.
                </p>
            )}

            <PromptWizard steps={wizardSteps} currentStep={currentStep}>
                {currentStep === 0 && (
                    <WizardStep1
                        register={register}
                        errors={errors}
                        onNext={handleNext}
                        onCancel={() => router.push(cancelHref)}
                    />
                )}

                {currentStep === 1 && (
                    <WizardStep2
                        register={register}
                        errors={errors}
                        contentValue={contentValue}
                        categoryValue={categoryValue}
                        aiImprovementSource={aiImprovementSource}
                        onApplyImprovement={handleApplyImprovement}
                        setValue={setValue}
                        autoFocusAiPanel={autoFocusAiPanel}
                        mode={mode}
                        promptId={defaultValues?.id}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {currentStep === 2 && (
                    <WizardStep3
                        control={control}
                        register={register}
                        errors={errors}
                        tagsValue={tagsValue}
                        setValue={setValue}
                        onBack={handleBack}
                        onSubmit={submitHandler}
                        pending={pending}
                        disableSubmit={disableSubmit}
                        mode={mode}
                    />
                )}
            </PromptWizard>
        </form>
    );
};
