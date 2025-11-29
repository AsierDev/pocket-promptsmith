'use client';

import { useState, ReactNode } from 'react';
import clsx from 'clsx';

export interface WizardStep {
    id: string;
    label: string;
    description: string;
}

interface PromptWizardProps {
    steps: WizardStep[];
    currentStep: number;
    children: ReactNode;
    onStepChange?: (step: number) => void;
}

export function ProgressIndicator({ steps, currentStep }: { steps: WizardStep[]; currentStep: number }) {
    return (
        <div className="mb-6">
            {/* Mobile: Simple step counter */}
            <div className="flex items-center justify-between sm:hidden">
                <div>
                    <p className="text-sm font-semibold text-slate-900">
                        Paso {currentStep + 1} de {steps.length}
                    </p>
                    <p className="text-xs text-slate-500">{steps[currentStep].label}</p>
                </div>
                <div className="flex items-center gap-1">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={clsx(
                                'h-2 w-2 rounded-full transition-colors',
                                index === currentStep
                                    ? 'bg-primary'
                                    : index < currentStep
                                        ? 'bg-primary/50'
                                        : 'bg-slate-200'
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop: Full progress bar with labels */}
            <div className="hidden sm:block">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-1 items-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className={clsx(
                                        'flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all',
                                        index === currentStep
                                            ? 'border-primary bg-primary text-white'
                                            : index < currentStep
                                                ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                                                : 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                                    )}
                                >
                                    {index < currentStep ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <span className="text-sm">{index + 1}</span>
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <p
                                        className={clsx(
                                            'text-sm font-bold',
                                            index === currentStep
                                                ? 'text-primary dark:text-violet-400'
                                                : index < currentStep
                                                    ? 'text-primary'
                                                    : 'text-slate-600 dark:text-slate-400'
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500">{step.description}</p>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={clsx(
                                        'mx-4 h-0.5 flex-1 transition-colors',
                                        index < currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function PromptWizard({ steps, currentStep, children }: PromptWizardProps) {
    return (
        <div className="space-y-6">
            <ProgressIndicator steps={steps} currentStep={currentStep} />
            <div className="min-h-[400px]">{children}</div>
        </div>
    );
}
