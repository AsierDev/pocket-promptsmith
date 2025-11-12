import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { env } from '@/lib/env';

export async function middleware(request: NextRequest) {
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
    data: { session }
  } = await supabase.auth.getSession();

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth');
  const isProtected = request.nextUrl.pathname.startsWith('/prompts');

  if (!session && isProtected) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  if (session && (request.nextUrl.pathname === '/' || isAuthRoute)) {
    const url = new URL('/prompts', request.url);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)']
};
