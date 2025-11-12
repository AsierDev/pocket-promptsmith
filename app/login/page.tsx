'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { requestMagicLink } from '@/features/auth/actions';
import { Button } from '@/components/common/Button';
import { FormField } from '@/components/common/FormField';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Introduce un email válido')
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', values.email);
      await requestMagicLink(formData);
      toast.success('Revisa tu bandeja de entrada para continuar');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-card"
        aria-describedby="login-description"
      >
        <div>
          <h1 className="text-2xl font-semibold">Inicia sesión</h1>
          <p id="login-description" className="text-sm text-slate-500">
            Recibirás un enlace mágico para acceder.
          </p>
        </div>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="tu@correo.com"
            aria-required
            {...register('email')}
          />
        </FormField>
        <Button type="submit" className="w-full" loading={loading}>
          Enviar enlace mágico
        </Button>
      </form>
    </main>
  );
}
