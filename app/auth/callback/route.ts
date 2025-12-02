import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('[DEBUG AUTH CALLBACK] Received auth callback');
  console.log('[DEBUG AUTH CALLBACK] Code present:', !!code);

  if (code) {
    try {
      const cookieStore = await cookies();
      
      // Create a Supabase client specifically for Route Handlers
      // This one CAN set cookies (unlike Server Components)
      const supabase = createServerClient(
        env.supabaseUrl,
        env.supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set({
                  name,
                  value,
                  ...options,
                  path: options?.path ?? '/',
                  sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
                  secure: process.env.NODE_ENV === 'production',
                  maxAge: options?.maxAge ?? 60 * 60 * 24 * 7, // 7 days
                });
              });
            },
          },
        }
      );

      console.log('[DEBUG AUTH CALLBACK] Exchanging code for session');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[DEBUG AUTH CALLBACK] Error exchanging code:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
      }

      console.log('[DEBUG AUTH CALLBACK] Session established for user:', data.user?.email);
      console.log('[DEBUG AUTH CALLBACK] Cookies should be set now');
    } catch (error) {
      console.error('[DEBUG AUTH CALLBACK] Unexpected error:', error);
      return NextResponse.redirect(new URL('/login?error=unexpected', requestUrl.origin));
    }
  }

  // Redirect to prompts dashboard after successful auth
  console.log('[DEBUG AUTH CALLBACK] Redirecting to dashboard');
  return NextResponse.redirect(new URL('/prompts/dashboard', requestUrl.origin));
}
