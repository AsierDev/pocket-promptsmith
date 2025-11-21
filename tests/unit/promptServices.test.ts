import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  fetchPrompts,
  fetchPromptById,
  fetchUserTags,
  incrementUseCount,
  toggleFavorite
} from '@/features/prompts/services';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

vi.mock('@/lib/supabaseServer', () => ({
  getSupabaseServerClient: vi.fn()
}));

const mockedSupabase = vi.mocked(getSupabaseServerClient);

const makeQuery = () => {
  const query: any = {
    data: [],
    or: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn(),
    select: vi.fn().mockReturnThis()
  };
  return query;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchPrompts', () => {
  it('returns empty results when there is no authenticated user', async () => {
    mockedSupabase.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) }
    } as any);

    const result = await fetchPrompts({});

    expect(result).toEqual({ prompts: [], count: 0, pageSize: 20 });
  });

  it('builds filters, favorites and pagination for authenticated users', async () => {
    const query = makeQuery();
    query.range.mockResolvedValue({
      data: [{ id: '1', user_id: 'user-1', category: 'Código' }],
      count: 1,
      error: null
    });

    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockReturnValue(query)
    };

    mockedSupabase.mockResolvedValue(supabase as any);

    const result = await fetchPrompts({
      q: 'hola',
      tags: ['demo'],
      favoritesOnly: true,
      sort: 'az',
      page: 2
    });

    expect(supabase.from).toHaveBeenCalledWith('prompts');
    expect(query.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(query.eq).toHaveBeenCalledWith('is_favorite', true);
    expect(query.contains).toHaveBeenCalledWith('tags', ['demo']);
    expect(query.or).toHaveBeenCalledWith('title.ilike.%hola%,content.ilike.%hola%');
    expect(query.order).toHaveBeenCalledWith('title', { ascending: true });
    expect(query.range).toHaveBeenCalledWith(20, 39);

    expect(result.prompts).toHaveLength(1);
    expect(result.count).toBe(1);
    expect(result.pageSize).toBe(20);
  });
});

describe('fetchPromptById', () => {
  it('returns the prompt when it exists', async () => {
    mockedSupabase.mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: '1', title: 'test' }, error: null })
      })
    } as any);

    const data = await fetchPromptById('1');
    expect(data.title).toBe('test');
  });

  it('throws when the prompt does not exist', async () => {
    mockedSupabase.mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'missing' } })
      })
    } as any);

    await expect(fetchPromptById('missing')).rejects.toThrow(/Prompt no encontrado/);
  });
});

describe('fetchUserTags', () => {
  it('returns an empty array when user is not authenticated', async () => {
    mockedSupabase.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) }
    } as any);

    expect(await fetchUserTags()).toEqual([]);
  });

  it('returns tags when rpc succeeds', async () => {
    mockedSupabase.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      rpc: vi.fn().mockResolvedValue({ data: ['tag1', 'tag2'], error: null })
    } as any);

    expect(await fetchUserTags()).toEqual(['tag1', 'tag2']);
  });

  it('logs and returns empty array when rpc fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedSupabase.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      rpc: vi.fn().mockResolvedValue({ data: null, error: new Error('db error') })
    } as any);

    expect(await fetchUserTags()).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('mutations', () => {
  it('updates favorite flag', async () => {
    mockedSupabase.mockResolvedValue({
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    } as any);

    await expect(toggleFavorite('1', true)).resolves.not.toThrow();
  });

  it('increments use count through RPC', async () => {
    mockedSupabase.mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({ data: 2, error: null })
    } as any);

    const result = await incrementUseCount('1');
    expect(result).toBe(2);
  });

  it('throws when rpc returns null or error', async () => {
    mockedSupabase.mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({ data: null, error: new Error('boom') })
    } as any);

    await expect(incrementUseCount('1')).rejects.toThrow(/boom/);
  });
});
