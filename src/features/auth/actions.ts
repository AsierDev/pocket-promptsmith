'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/authUtils';

export const signIn = async (formData: FormData) => {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();

  if (!email || !password) {
    throw new Error('Email y contraseña son obligatorios');
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect('/prompts/dashboard');
};

export const signUp = async (formData: FormData) => {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();

  if (!email || !password) {
    throw new Error('Email y contraseña son obligatorios');
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect('/prompts/dashboard');
};

export const signOut = async () => {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();

  // Clear PWA session storage as well
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('pps_session_data');
      localStorage.removeItem('pps_last_active_timestamp');
    } catch (error) {
      console.error('Failed to clear PWA session data:', error);
    }
  }

  redirect('/login');
};
