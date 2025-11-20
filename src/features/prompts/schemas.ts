import { z } from 'zod';

export const PROMPT_CONTENT_MAX_LENGTH = 4000;

export const PROMPT_CATEGORIES = [
  'Escritura',
  'Código',
  'Marketing',
  'Análisis',
  'Educación',
  'Creatividad',
  'Otros'
] as const;

export const promptFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  summary: z
    .string()
    .max(260, 'Usa una descripción breve (260 caracteres máx.)')
    .optional()
    .transform((value) => value?.trim() ?? ''),
  content: z
    .string()
    .min(20, 'Comparte más contexto para sacar mejor provecho')
    .max(PROMPT_CONTENT_MAX_LENGTH, `Has superado el límite de ${PROMPT_CONTENT_MAX_LENGTH} caracteres. Simplifica el prompt o divídelo en varios.`),
  category: z.enum(PROMPT_CATEGORIES, {
    errorMap: () => ({ message: 'Selecciona una categoría' })
  }),
  tags: z.array(z.string().min(2)).max(8).default([]),
  thumbnail_url: z.string().url().optional().or(z.literal(''))
});

export type PromptFormValues = z.infer<typeof promptFormSchema>;

export const filtersSchema = z.object({
  q: z.string().optional(),
  category: z.enum(PROMPT_CATEGORIES).optional(),
  tags: z.array(z.string()).optional(),
  favorites: z.boolean().optional(),
  sort: z.enum(['recent', 'usage', 'az', 'favorites']).default('recent'),
  page: z.number().min(1).default(1)
});
