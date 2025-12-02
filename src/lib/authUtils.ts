import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { env } from '@/lib/env';
import { cookies } from 'next/headers';
import { getSessionFromLocalStorage } from './pwaSessionStorage';

export const getSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database, 'public'>(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In Server Components, we cannot set cookies.
          // Cookie updates (session refresh) must be handled by middleware.
          // This is a no-op to prevent "Cookies can only be modified in a Server Action" errors.
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({
                name,
                value,
                ...options,
                path: options?.path ?? '/',
                sameSite:
                  (options?.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
                secure: process.env.NODE_ENV === 'production'
              });
            });
          } catch {
            // Fail silently - this is expected in Server Components
          }
        }
      }
    }
  );
};

export const getSession = async () => {
  const supabase = await getSupabaseServerClient();

  // First try standard cookie-based authentication
  const { data, error } = await supabase.auth.getUser();

  if (data?.user) {
    // Session found via cookies - this is the ideal case
    return {
      user: data.user,
      access_token: '', // Not available via getUser
      refresh_token: '', // Not available via getUser
      expires_in: 0,
      expires_at: 0,
      source: 'cookies'
    };
  }

  // If no cookie session, this might be a PWA launch scenario
  // Check if we're in a PWA context and try hybrid approach
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(display-mode: standalone)').matches
  ) {
    // In PWA mode, try to get session from localStorage
    const localSession = getSessionFromLocalStorage();

    if (localSession?.isValid && localSession?.isRecent) {
      // Try to refresh the session using the stored tokens
      try {
        const { data: refreshedData, error: refreshError } =
          await supabase.auth.setSession({
            access_token: localSession.session.accessToken,
            refresh_token: localSession.session.refreshToken
          });

        if (refreshedData?.user) {
          // Successfully refreshed session from localStorage
          return {
            user: refreshedData.user,
            access_token: localSession.session.accessToken,
            refresh_token: localSession.session.refreshToken,
            expires_in: Math.floor(
              (localSession.session.expiresAt - Date.now()) / 1000
            ),
            expires_at: localSession.session.expiresAt,
            source: 'localStorage_refreshed'
          };
        }
      } catch (refreshError) {
        console.error(
          'Failed to refresh session from localStorage:',
          refreshError
        );
      }
    }
  }

  // If we reach here, no valid session was found
  return null;
};

export const createSupabaseMiddlewareClient = (request: any, response: any) => {
  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({
          name,
          value,
          ...options,
          path: options?.path ?? '/',
          sameSite: options?.sameSite ?? 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: options?.maxAge ?? 60 * 60 * 24 * 7 // 7 days default
        });
      },
      remove(name: string, options: any) {
        response.cookies.set({
          name,
          value: '',
          ...options,
          maxAge: 0,
          path: options?.path ?? '/'
        });
      }
    }
  });
};
