import { describe, expect, it } from 'vitest';

import { hasIncompleteVariables } from '@/features/variables/utils';

describe('use prompt drawer helpers', () => {
  it('detects missing variables when a field is empty', () => {
    expect(hasIncompleteVariables(['nombre', 'industria'], { nombre: 'Ana', industria: '' })).toBe(true);
  });

  it('requires non-whitespace values', () => {
    expect(hasIncompleteVariables(['objetivo'], { objetivo: '   ' })).toBe(true);
    expect(hasIncompleteVariables(['objetivo'], { objetivo: 'Generar leads' })).toBe(false);
  });

  it('returns false when all variables are filled', () => {
    expect(
      hasIncompleteVariables(['nombre', 'industria'], { nombre: 'Pepe', industria: 'Construcción' })
    ).toBe(false);
  });
});
