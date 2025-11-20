import { describe, expect, it } from 'vitest';
import { resolveLibrarySection } from '@/features/prompts/components/DashboardNav';

describe('dashboard navigation helpers', () => {
  it('marks library as active for base route without favorites', () => {
    expect(resolveLibrarySection('/prompts', null)).toBe('library');
  });

  it('activates favorites when the query flag is present', () => {
    expect(resolveLibrarySection('/prompts', 'true')).toBe('favorites');
  });

  it('never keeps items active for create or detail routes', () => {
    expect(resolveLibrarySection('/prompts/new', null)).toBe('other');
    expect(resolveLibrarySection('/prompts/123', null)).toBe('other');
  });
});
