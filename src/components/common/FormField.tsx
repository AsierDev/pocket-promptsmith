import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  children: ReactNode;
}

export const FormField = ({ label, htmlFor, description, error, children }: FormFieldProps) => (
  <div className="space-y-2">
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
    {children}
    {error && (
      <p role="alert" className="text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);
