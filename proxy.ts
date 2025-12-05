import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createSupabaseMiddlewareClient } from '@/lib/authUtils';

const PROTECTED_PREFIXES = ['/prompts'];
const AUTH_PREFIXES = ['/login', '/auth'];

const pathStartsWith = (pathname: string, prefixes: string[]) =>
  prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiresSession = pathStartsWith(pathname, PROTECTED_PREFIXES);
  const redirectAuthenticated =
    pathStartsWith(pathname, AUTH_PREFIXES) || pathname === '/';

  // Skip auth entirely for public routes
  if (!requiresSession && !redirectAuthenticated) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // For login/public routes, only check auth to potentially redirect authenticated users
  // But if there are corrupted cookies, just skip the check and let them through
  if (!requiresSession) {
    try {
      const supabase = createSupabaseMiddlewareClient(request, response);

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user && redirectAuthenticated) {
        return NextResponse.redirect(
          new URL('/prompts/dashboard', request.url)
        );
      }
    } catch (error) {
      // If auth check fails on public routes, just continue - it's not critical
      console.error(
        'Auth check failed on public route, continuing anyway:',
        error
      );
    }
    return response;
  }

  // For protected routes, we MUST verify auth
  const supabase = createSupabaseMiddlewareClient(request, response);

  // Use getUser() instead of getSession() to avoid token refresh attempts
  // which can cause infinite loops with invalid refresh tokens
  const {
    data: { user },
    error: sessionError
  } = await supabase.auth.getUser();

  // Handle different error cases
  if (sessionError) {
    // Clean up corrupted auth cookies for refresh token errors
    if (
      sessionError.message?.includes('refresh_token_not_found') ||
      sessionError.message?.includes('Invalid Refresh Token')
    ) {
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      // Don't log these as errors - they're expected when cookies are corrupted
      // Just continue without authentication
    }
    // AuthSessionMissingError is expected when there are no auth cookies - not an actual error
    else if (sessionError.name !== 'AuthSessionMissingError') {
      console.error('Error retrieving user in proxy', sessionError);
      // For actual errors (not just missing session), clear cookies and redirect
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const session = user ? { user } : null;

  if (!session && requiresSession) {
    // Before redirecting to login, check if there might be a saved session in localStorage
    // that will be hydrated by SessionHydration component
    // This prevents the flash of login page on PWA startup when session exists in localStorage
    const hasPotentialSession = request.cookies.get('pps_has_session')?.value === 'true';
    
    if (!hasPotentialSession) {
      const loginUrl = new URL('/login', request.url);
      const redirectTo = `${pathname}${request.nextUrl.search ?? ''}`;
      if (redirectTo !== '/login') {
        loginUrl.searchParams.set('redirectTo', redirectTo);
      }
      return NextResponse.redirect(loginUrl);
    }
    
    // If we have a potential localStorage session, let the request through
    // SessionHydration will handle redirecting if the session is invalid
  }

  if (session && redirectAuthenticated) {
    return NextResponse.redirect(new URL('/prompts/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/', '/login', '/auth/:path*', '/prompts/:path*']
};
