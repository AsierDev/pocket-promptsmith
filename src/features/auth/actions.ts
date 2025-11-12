'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

const getSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const requestMagicLink = async (formData: FormData) => {
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    throw new Error('El email es obligatorio');
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true };
};

export const signOut = async () => {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
};
