import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@/lib/authUtils';
import { FREEMIUM_LIMITS } from '@/lib/limits';
import { getProfile } from '@/lib/supabaseServer';
import {
  AiImproveRequestSchema,
  validateRequest
} from '@/lib/validation/apiSchemas';
import { improvePromptWithAI } from '@/features/ai-improvements/client';
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

    const requestBody = await request.json();
    const validatedData = validateRequest(AiImproveRequestSchema)(requestBody);

    const { content, goal, category, temperature, length } = validatedData;

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
    console.error('AI improve route error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error.message.includes('OPENROUTER_API_KEY')) {
        return NextResponse.json(
          { error: 'Servicio temporalmente no disponible' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
