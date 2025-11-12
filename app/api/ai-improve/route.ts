import { NextResponse } from 'next/server';
import { improvePromptWithAI, type PromptCategory } from '@/features/ai-improvements/client';

export async function POST(request: Request) {
  try {
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
