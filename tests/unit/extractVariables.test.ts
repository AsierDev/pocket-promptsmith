import { describe, expect, it } from 'vitest';

import { extractVariables, replaceVariables } from '@/features/variables/extractVariables';

describe('extractVariables', () => {
  it('returns empty array when no variables', () => {
    expect(extractVariables('Hola mundo')).toEqual([]);
  });

  it('deduplicates variables edge cases', () => {
    expect(extractVariables('Hola {{nombre}} y {{ nombre }} y {{nombre}}')).toEqual(['nombre']);
  });

  it('normalizes whitespace to underscores', () => {
    expect(extractVariables('Hola {{nombre completo}}')).toEqual(['nombre_completo']);
  });
});

describe('replaceVariables', () => {
  it('replaces variables while keeping missing placeholders intact', () => {
    const content = 'Hola {{nombre}} de {{empresa}}';
    expect(
      replaceVariables(content, {
        nombre: 'Ana'
      })
    ).toEqual('Hola Ana de {{empresa}}');
  });
});
