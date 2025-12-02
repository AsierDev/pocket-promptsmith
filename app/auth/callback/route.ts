import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Prepare redirect response
  const redirectUrl = new URL('/prompts/dashboard', requestUrl.origin);
  const response = NextResponse.redirect(redirectUrl);

  console.log('[DEBUG AUTH CALLBACK] Start - Code present:', !!code);

  if (!code) {
    console.log('[DEBUG AUTH CALLBACK] No code in URL, redirecting anyway');
    return response;
  }

  try {
    const cookieStore = await cookies();
    const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];
    
    // Create Supabase client that collects cookies to set
    const supabase = createServerClient(
      env.supabaseUrl,
      env.supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet_) {
            // Collect cookies to set them on the response later
            cookiesToSet.push(...cookiesToSet_);
          },
        },
      }
    );

    console.log('[DEBUG AUTH CALLBACK] Exchanging code for session');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('[DEBUG AUTH CALLBACK] Error:', error.message);
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
    }

    console.log('[DEBUG AUTH CALLBACK] Session OK for:', data.user?.email);
    console.log('[DEBUG AUTH CALLBACK] Setting', cookiesToSet.length, 'cookies on response');

    // Set ALL cookies on the redirect response
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set({
        name,
        value,
        ...options,
        path: options?.path ?? '/',
        sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: options?.maxAge ?? 60 * 60 * 24 * 7, // 7 days
      });
    });

    console.log('[DEBUG AUTH CALLBACK] Cookies set on redirect response');
  } catch (error) {
    console.error('[DEBUG AUTH CALLBACK] Unexpected error:', error);
    return NextResponse.redirect(new URL('/login?error=unexpected', requestUrl.origin));
  }

  return response;
}

