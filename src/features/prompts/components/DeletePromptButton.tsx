'use client';

import { useState, useTransition } from 'react';
import { deletePromptAction } from '@/features/prompts/actions';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useRouter } from 'next/navigation';

interface Props {
  promptId: string;
}

export const DeletePromptButton = ({ promptId }: Props) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      await deletePromptAction(promptId);
      setOpen(false);
      router.push('/prompts');
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
