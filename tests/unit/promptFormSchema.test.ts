import { describe, expect, it } from 'vitest';
import { promptFormSchema, PROMPT_CONTENT_MAX_LENGTH } from '@/features/prompts/schemas';

const baseForm = {
  title: 'Test prompt',
  summary: 'Descripción corta',
  content: 'Contenido válido con contexto suficiente',
  category: 'Escritura' as const,
  tags: [],
  thumbnail_url: ''
};

describe('prompt form schema', () => {
  it('accepts content within the character limit', () => {
    const parsed = promptFormSchema.safeParse(baseForm);
    expect(parsed.success).toBe(true);
  });

  it('rejects content longer than the limit', () => {
    const longContent = 'a'.repeat(PROMPT_CONTENT_MAX_LENGTH + 1);
    const parsed = promptFormSchema.safeParse({ ...baseForm, content: longContent });
    expect(parsed.success).toBe(false);
  });
});
