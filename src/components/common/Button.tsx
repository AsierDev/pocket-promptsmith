'use client';

import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', loading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 active:scale-95',
          {
            primary:
              'bg-primary text-white hover:bg-violet-600 hover:shadow-md focus-visible:ring-primary',
            secondary:
              'bg-slate-100 text-slate-900 hover:bg-slate-200 hover:shadow-sm focus-visible:ring-slate-400',
            ghost:
              'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300 dark:text-slate-200 dark:hover:bg-slate-800',
            danger:
              'bg-red-600 text-white hover:bg-red-700 hover:shadow-md focus-visible:ring-red-400'
          }[variant],
          className
        )}
        data-loading={loading}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="sr-only">Cargando</span>
            {typeof children === 'string' ? children : 'Procesando…'}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
