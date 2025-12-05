import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@/lib/authUtils';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Keep next parameter to preserve redirect intent, but default to success page
  const next = searchParams.get('next') ?? '/prompts/dashboard';

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to success page which will save session to localStorage
      // and then redirect to the intended destination
      return NextResponse.redirect(`${origin}/auth/success?next=${encodeURIComponent(next)}`);
    }

    console.error('Error exchanging code for session:', error);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
