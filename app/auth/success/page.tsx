'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { Database } from '@/types/supabase';

/**
 * OAuth success page that saves session to localStorage for PWA persistence
 * This runs after /auth/callback exchanges the OAuth code for a session
 */
export default function AuthSuccessPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saveOAuthSession = async () => {
      try {
        // Get redirect destination from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('next') || '/prompts/dashboard';

        // Get environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Missing Supabase environment variables');
        }

        // Create client to read session from cookies (set by callback)
        const supabase = createBrowserClient<Database>(
          supabaseUrl,
          supabaseAnonKey
        );

        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error('No session found after OAuth callback');
        }

        // Save to localStorage for PWA persistence
        const now = Date.now();
        const expiresAtMs =
          typeof session.expires_at === 'number'
            ? session.expires_at * 1000
            : new Date(session.expires_at ?? 0).getTime();

        const sessionData = {
          userId: session.user.id,
          email: session.user.email ?? '',
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: expiresAtMs,
          storedAt: now,
          source: 'oauth'
        };

        localStorage.setItem('pps_session_data', JSON.stringify(sessionData));
        localStorage.setItem('pps_last_active_timestamp', now.toString());

        // Set cookie flag for proxy.ts with same expiry as session
        const maxAgeSeconds = Math.floor((expiresAtMs - now) / 1000);
        if (maxAgeSeconds > 0) {
          document.cookie =
            `pps_has_session=true; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
        } else {
          console.warn('Session expiry is in the past, skipping cookie creation');
        }

        // Redirect to intended destination
        window.location.replace(redirectTo);
      } catch (err) {
        console.error('Error saving OAuth session:', err);
        setError((err as Error).message);
      }
    };

    saveOAuthSession();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-lg bg-white p-8 text-center shadow-card dark:bg-slate-900">
          <h1 className="text-xl font-bold text-red-600">
            Error al procesar autenticación
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {error}
          </p>
          <a
            href="/login"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
          >
            Volver al login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Completando autenticación...
        </p>
      </div>
    </div>
  );
}
