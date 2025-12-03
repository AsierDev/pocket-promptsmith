import { describe, expect, it, vi } from 'vitest';
import {
  normalizeVariableName,
  parseResponse,
  sanitizeImprovedVariables,
  stripCodeFences
} from '@/features/ai-improvements/client';

vi.mock('@/lib/env', () => ({
  env: {
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-key',
    googleClientId: 'test-google-id',
    googleClientSecret: 'test-google-secret',
    openRouterKey: 'test-router-key',
    openRouterUrl: 'https://test.openrouter.ai',
    siteUrl: 'https://test.com'
  }
}));

describe('AI helpers', () => {
  it('normalizes variable names by trimming and removing braces', () => {
    expect(normalizeVariableName('  {{User Name}}  ')).toBe('User_Name');
  });

  it('sanitizes improved prompts removing unknown variables', () => {
    const { sanitized, removed } = sanitizeImprovedVariables(
      'Hola {{name}} {{newVar}}',
      new Set(['name'])
    );
    expect(sanitized).toBe('Hola {{name}} newVar');
    expect(removed).toEqual(['newVar']);
  });

  it('strips code fences from AI responses', () => {
    const raw = '```json\n{"foo":"bar"}\n```';
    expect(stripCodeFences(raw)).toBe('{"foo":"bar"}');
  });

  it('parses valid AI response payloads', () => {
    const result = parseResponse(
      '{"improved_prompt":"Listo","changes":["Mejora"],"diff":"+ change","modelUsed":"gpt"}'
    );
    expect(result.improved_prompt).toBe('Listo');
    expect(result.changes).toEqual(['Mejora']);
    expect(result.diff).toBe('+ change');
    expect(result.modelUsed).toBe('gpt');
  });

  it('falls back gracefully when AI payload is invalid', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = parseResponse('```json\n{"unexpected":true}\n```');
    expect(result.improved_prompt).toContain('"unexpected":true');
    expect(result.changes[0]).toMatch(/No se pudo parsear/);
    expect(result.diff).toBe('');
    consoleSpy.mockRestore();
  });
});
