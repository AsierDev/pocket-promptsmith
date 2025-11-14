import { getSupabaseServerClient } from '@/lib/supabaseServer';
import type { PromptRow } from '@/types/supabase';

export type PromptFilters = {
  q?: string;
  category?: PromptRow['category'];
  tags?: string[];
  favoritesOnly?: boolean;
  sort?: 'recent' | 'usage' | 'az' | 'favorites';
  page?: number;
};

const PAGE_SIZE = 20;

export const fetchPrompts = async ({ q, category, tags, favoritesOnly, sort = 'recent', page = 1 }: PromptFilters) => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { prompts: [] as PromptRow[], count: 0, pageSize: PAGE_SIZE };

  let query = supabase
    .from('prompts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  if (q) {
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (tags && tags.length > 0) {
    query = query.contains('tags', tags);
  }

  const onlyFavorites = favoritesOnly || sort === 'favorites';

  if (onlyFavorites) {
    query = query.eq('is_favorite', true);
  }

  switch (sort) {
    case 'usage':
      query = query.order('use_count', { ascending: false });
      break;
    case 'az':
      query = query.order('title', { ascending: true });
      break;
    case 'favorites':
      query = query.order('title');
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return { prompts: (data ?? []) as PromptRow[], count: count ?? 0, pageSize: PAGE_SIZE };
};

export const fetchPromptById = async (id: string) => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from('prompts').select('*').eq('id', id).single();
  if (error || !data) {
    throw new Error('Prompt no encontrado');
  }
  return data as PromptRow;
};

export const fetchUserTags = async () => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.rpc('get_user_tags', { target_user_id: user.id });
  if (error || !data) {
    console.error('Error fetching tags', error);
    return [];
  }
  return data;
};
export const toggleFavorite = async (promptId: string, nextValue: boolean) => {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from('prompts').update({ is_favorite: nextValue }).eq('id', promptId);
  if (error) {
    throw new Error(error.message);
  }
};

export const incrementUseCount = async (promptId: string) => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc('increment_prompt_use_count', { target_prompt_id: promptId });
  if (error || data === null) {
    throw new Error(error?.message ?? 'No se pudo actualizar el uso del prompt.');
  }
  return data;
};
