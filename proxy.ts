import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { env } from '@/lib/env';

const PROTECTED_PREFIXES = ['/prompts'];
const AUTH_PREFIXES = ['/login', '/auth'];

const pathStartsWith = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiresSession = pathStartsWith(pathname, PROTECTED_PREFIXES);
  const redirectAuthenticated = pathStartsWith(pathname, AUTH_PREFIXES) || pathname === '/';

  if (!requiresSession && !redirectAuthenticated) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options) {
        response.cookies.set({
          name,
          value,
          ...options,
          path: options?.path ?? '/'
        });
      },
      remove(name: string, options) {
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

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error retrieving session in proxy', sessionError);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!session && requiresSession) {
    const loginUrl = new URL('/login', request.url);
    const redirectTo = `${pathname}${request.nextUrl.search ?? ''}`;
    if (redirectTo !== '/login') {
      loginUrl.searchParams.set('redirectTo', redirectTo);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (session && redirectAuthenticated) {
    return NextResponse.redirect(new URL('/prompts', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/', '/login', '/auth/:path*', '/prompts/:path*']
};
