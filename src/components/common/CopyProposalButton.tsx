'use client';

import { toast } from 'sonner';

import { Button } from '@/components/common/Button';

interface CopyProposalButtonProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  children?: React.ReactNode;
}

export const CopyProposalButton = ({
  text,
  variant = 'secondary',
  className,
  children = 'Copiar propuesta',
}: CopyProposalButtonProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Propuesta copiada');
    } catch (error) {
      toast.error('No se pudo copiar');
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleCopy}
      className={className}
    >
      {children}
    </Button>
  );
};
