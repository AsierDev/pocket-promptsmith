import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    console.log('[AUTH CALLBACK] No code, redirecting to dashboard');
    return NextResponse.redirect(new URL('/prompts/dashboard', requestUrl.origin));
  }

  try {
    const cookieStore = await cookies();
    
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
                maxAge: options?.maxAge ?? 60 * 60 * 24 * 7,
              });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('[AUTH CALLBACK] Error:', error.message);
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
    }

    console.log('[AUTH CALLBACK] Session OK for:', data.user?.email);

    // Return HTML that will redirect client-side AFTER cookies are set
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=/prompts/dashboard">
          <script>window.location.href = '/prompts/dashboard';</script>
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('[AUTH CALLBACK] Unexpected error:', error);
    return NextResponse.redirect(new URL('/login?error=unexpected', requestUrl.origin));
  }
}

