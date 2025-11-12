'use client';

import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60',
          {
            primary: 'bg-primary text-white hover:bg-violet-600 focus-visible:ring-primary',
            secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400',
            ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400'
          }[variant],
          className
        )}
        data-loading={loading}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? 'Procesando…' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
