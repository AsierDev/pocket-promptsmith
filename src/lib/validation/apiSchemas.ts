import { z } from 'zod';

export const AiImproveRequestSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content cannot exceed 5000 characters'),
  goal: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
  category: z.enum([
    'Código',
    'Escritura',
    'Marketing',
    'Análisis',
    'Creatividad',
    'Educación',
    'Otros'
  ]),
  temperature: z
    .number()
    .min(0, 'Temperature must be between 0 and 1')
    .max(1, 'Temperature must be between 0 and 1')
    .optional(),
  length: z.enum(['short', 'medium', 'long']).optional()
});

export type AiImproveRequest = z.infer<typeof AiImproveRequestSchema>;

export const validateRequest = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        throw new Error(`Validation failed: ${errorMessage}`);
      }
      throw error;
    }
  };
};
