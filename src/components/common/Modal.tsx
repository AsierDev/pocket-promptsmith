'use client';

import { DialogHTMLAttributes, PropsWithChildren, useEffect, useId } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/common/Button';

type ModalProps = PropsWithChildren<{
  title: string;
  open: boolean;
  description?: string;
  onClose: () => void;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}> & Omit<DialogHTMLAttributes<HTMLDivElement>, 'title'>;

export const Modal = ({
  title,
  description,
  open,
  onClose,
  actions,
  size = 'md',
  children
}: ModalProps) => {
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const descriptionId = description ? `${modalId}-description` : undefined;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handler);
    }
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur"
    >
      <div
        className={clsx(
          'relative rounded-2xl bg-white p-6 shadow-2xl focus:outline-none dark:bg-slate-900',
          {
            sm: 'w-full max-w-md',
            md: 'w-full max-w-2xl',
            lg: 'w-full max-w-4xl'
          }[size]
        )}
      >
        <div className="mb-4 space-y-1">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-2">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          {actions}
        </div>
      </div>
    </div>
  );
};
