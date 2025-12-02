import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { env } from '@/lib/env';
import { cookies } from 'next/headers';

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
  // Use getUser() instead of getSession() in Server Components to avoid
  // attempting to refresh the session and set cookies, which causes errors.
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  if (!data.user) {
    return null;
  }

  // Returns a minimalist session-like object with the user
  // This maintains compatibility with code that checks session.user
  return {
    user: data.user,
    access_token: '', // Not available via getUser
    refresh_token: '', // Not available via getUser
    expires_in: 0,
    expires_at: 0
  };
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
