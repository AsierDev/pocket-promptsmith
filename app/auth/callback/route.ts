import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/authUtils';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('[DEBUG AUTH CALLBACK] Received auth callback');
  console.log('[DEBUG AUTH CALLBACK] Code present:', !!code);

  if (code) {
    try {
      const supabase = await getSupabaseServerClient();
      console.log('[DEBUG AUTH CALLBACK] Exchanging code for session');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[DEBUG AUTH CALLBACK] Error exchanging code:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
      }

      console.log('[DEBUG AUTH CALLBACK] Session established for user:', data.user?.email);
    } catch (error) {
      console.error('[DEBUG AUTH CALLBACK] Unexpected error:', error);
      return NextResponse.redirect(new URL('/login?error=unexpected', requestUrl.origin));
    }
  }

  // Redirect to prompts dashboard after successful auth
  console.log('[DEBUG AUTH CALLBACK] Redirecting to dashboard');
  return NextResponse.redirect(new URL('/prompts/dashboard', requestUrl.origin));
}
