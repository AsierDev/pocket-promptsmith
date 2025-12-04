'use server';

import { redirect } from 'next/navigation';

import { getSupabaseServerClient } from '@/lib/authUtils';
import { env } from '@/lib/env';
import { clearSessionFromLocalStorage } from '@/lib/pwaSessionStorage';
import { processAuthSession } from '@/lib/sessionUtils';

export const signIn = async (formData: FormData) => {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();

  if (!email || !password) {
    throw new Error('Email y contraseña son obligatorios');
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session || !data.user) {
    throw new Error('No se pudo iniciar sesión');
  }

  return processAuthSession(data.session, data.user);
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session || !data.user) {
    throw new Error('No se pudo crear la cuenta');
  }

  return processAuthSession(data.session, data.user);
};

export const signOut = async () => {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();

  // Clear PWA session storage as well
  // Note: This runs on server, so it won't actually clear localStorage
  // The client-side signOut UI should also call clearSessionFromLocalStorage()
  clearSessionFromLocalStorage();

  redirect('/login');
};

export const signInWithGoogle = async () => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${env.siteUrl}/auth/callback`
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return { url: data.url };
};
