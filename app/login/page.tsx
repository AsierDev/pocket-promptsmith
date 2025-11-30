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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-card dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800 sm:p-10"
        aria-describedby="login-description"
      >
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Inicia sesión</h1>
          <p id="login-description" className="text-sm text-slate-500 dark:text-slate-400">
            Recibirás un enlace mágico para acceder a tu cuenta.
          </p>
        </div>
        <div className="space-y-6">
          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
            className="space-y-2"
            labelClassName="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            <input
              id="email"
              type="email"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-primary dark:focus:ring-primary/20"
              placeholder="tu@correo.com"
              aria-required
              {...register('email')}
            />
          </FormField>
          <Button type="submit" className="w-full py-3 text-base font-semibold" loading={loading}>
            Enviar enlace mágico
          </Button>
        </div>
      </form>
    </main>
  );
}
