import { NextResponse } from 'next/server';
import {
  improvePromptWithAI,
  type PromptCategory,
  type PromptLengthSetting
} from '@/features/ai-improvements/client';
import { getProfile } from '@/lib/supabaseServer';
import { getSupabaseServerClient } from '@/lib/authUtils';
import { FREEMIUM_LIMITS } from '@/lib/limits';
import { isPremiumModel } from '@/features/ai-improvements/models';
import { AI_IMPROVEMENT_SOURCE_MAX_LENGTH } from '@/features/prompts/schemas';

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(
        'Error retrieving session for AI improve route',
        sessionError
      );
      return NextResponse.json(
        { error: 'No se pudo validar tu sesión' },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const profile = await getProfile();

    const { content, goal, category, temperature, length } =
      (await request.json()) as {
        content: string;
        goal?: string;
        category: PromptCategory;
        temperature?: number;
        length?: PromptLengthSetting;
      };
    const normalizedContent = content?.trim?.() ?? '';
    if (!normalizedContent) {
      return NextResponse.json(
        { error: 'Contenido requerido' },
        { status: 400 }
      );
    }
    if (normalizedContent.length > AI_IMPROVEMENT_SOURCE_MAX_LENGTH) {
      return NextResponse.json(
        {
          error:
            'Este prompt es demasiado largo para mejorarlo de una vez. Usa el campo Texto a mejorar para trabajar por partes.'
        },
        { status: 400 }
      );
    }

    const premiumUsedToday = profile?.improvements_used_today ?? 0;
    const result = await improvePromptWithAI(
      normalizedContent,
      category ?? 'Otros',
      {
        goal,
        temperature,
        length,
        premiumUsedToday
      }
    );
    const usedPremiumModel = isPremiumModel(result.modelUsed);
    const nextPremiumCount = usedPremiumModel
      ? Math.min(premiumUsedToday + 1, FREEMIUM_LIMITS.improvementsPerDay)
      : premiumUsedToday;

    if (usedPremiumModel && profile) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ improvements_used_today: nextPremiumCount })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Error updating improvements_used_today', updateError);
        return NextResponse.json(
          { error: 'No se pudo registrar el uso de IA, inténtalo de nuevo.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ...result,
      premiumImprovementsUsedToday: nextPremiumCount
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
