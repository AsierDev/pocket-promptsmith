import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/authUtils';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      const supabase = await getSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      return NextResponse.redirect(new URL('/login?error=unexpected', requestUrl.origin));
    }
  }

  // Redirect to prompts dashboard after successful auth
  return NextResponse.redirect(new URL('/prompts/dashboard', requestUrl.origin));
}
