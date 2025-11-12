declare global {
  // eslint-disable-next-line no-var
  var __PPS_ENV_WARNED__: boolean | undefined;
}

const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0 && !globalThis.__PPS_ENV_WARNED__) {
  console.warn(`Missing env var(s): ${missingEnv.join(', ')}. Configure .env.local before running.`);
  globalThis.__PPS_ENV_WARNED__ = true;
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  openRouterKey: process.env.OPENROUTER_API_KEY ?? '',
  openRouterUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'
};
