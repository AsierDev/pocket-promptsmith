import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL debe ser una URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY es obligatorio'),
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY es obligatorio'),
  OPENROUTER_BASE_URL: z.string().url().optional()
});

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  throw new Error('env.ts es solo para uso en el servidor');
}

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const messages = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Configuración de entorno inválida: ${messages}. Define las variables requeridas en .env.local`);
}

export const env = {
  supabaseUrl: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  openRouterKey: parsed.data.OPENROUTER_API_KEY,
  openRouterUrl: parsed.data.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'
};
