import { NextResponse } from 'next/server';
import { improvePromptWithAI, type PromptCategory } from '@/features/ai-improvements/client';
import { getSupabaseServerClient, getProfile } from '@/lib/supabaseServer';
import { hasReachedImproveLimit } from '@/lib/limits';

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error retrieving session for AI improve route', sessionError);
      return NextResponse.json({ error: 'No se pudo validar tu sesión' }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const profile = await getProfile();
    if (profile && hasReachedImproveLimit(profile.improvements_used_today)) {
      return NextResponse.json({ error: 'Has utilizado todas tus mejoras hoy.' }, { status: 429 });
    }

    const { content, goal, category } = (await request.json()) as {
      content: string;
      goal?: string;
      category: PromptCategory;
    };
    if (!content) {
      return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 });
    }

    const result = await improvePromptWithAI(content, category ?? 'Otros', goal);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
