import { createServerClient } from '@supabase/ssr';

import { env } from '@/lib/env';
import type { Database } from '@/types/supabase';

export const getSupabaseServerClient = async () => {
  // Dynamic import to avoid client-side bundling issues
  const { cookies } = await import('next/headers');
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

  // Server-side session check via cookies
  // PWA session hydration from localStorage is now handled by useSessionHydration hook
  const { data, error } = await supabase.auth.getUser();

  if (data?.user) {
    return {
      user: data.user,
      access_token: '', // Not available via getUser
      refresh_token: '', // Not available via getUser
      expires_in: 0,
      expires_at: 0,
      source: 'cookies'
    };
  }

  // No valid session found
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
