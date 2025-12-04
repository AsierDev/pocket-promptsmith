'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { deletePromptAction } from '@/features/prompts/actions';


interface Props {
  promptId: string;
}

export const DeletePromptButton = ({ promptId }: Props) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePromptAction(promptId);
        setOpen(false);
        router.push('/prompts');
      } catch (error) {
        toast.error((error as Error).message ?? 'No se pudo eliminar el prompt.');
      }
    });
  };

  return (
    <>
      <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
        Eliminar
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="¿Seguro que quieres eliminar?"
        description="Esta acción no se puede deshacer"
        actions={
          <Button variant="danger" onClick={handleDelete} loading={pending}>
            Confirmar
          </Button>
        }
      >
        <p className="text-sm text-slate-600">
          El prompt desaparecerá de tu biblioteca y liberará un espacio del límite gratuito.
        </p>
      </Modal>
    </>
  );
};
