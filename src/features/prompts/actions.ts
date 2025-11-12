'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient, getProfile } from '@/lib/supabaseServer';
import { promptFormSchema } from '@/features/prompts/schemas';
import { hasReachedPromptLimit, hasReachedImproveLimit } from '@/lib/limits';
import { incrementUseCount, toggleFavorite } from '@/features/prompts/services';

const parseTags = (raw: FormDataEntryValue | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (error) {
    return [];
  }
};

export const createPromptAction = async (formData: FormData) => {
  const supabase = await getSupabaseServerClient();
  const profile = await getProfile();

  if (profile && hasReachedPromptLimit(profile.prompt_quota_used)) {
    throw new Error('Has alcanzado el límite de 10 prompts. Upgrade a Pro');
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const parsed = promptFormSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
    category: formData.get('category'),
    tags: parseTags(formData.get('tags')),
    thumbnail_url: formData.get('thumbnail_url')
  });

  const { error } = await supabase.from('prompts').insert({
    user_id: user.id,
    title: parsed.title,
    content: parsed.content,
    category: parsed.category,
    tags: parsed.tags,
    thumbnail_url: parsed.thumbnail_url ?? null
  });

  if (error) {
    throw new Error(error.message);
  }

  if (profile) {
    await supabase
      .from('profiles')
      .update({ prompt_quota_used: profile.prompt_quota_used + 1 })
      .eq('id', profile.id);
  }

  revalidatePath('/prompts');
  return { ok: true };
};

export const updatePromptAction = async (promptId: string, formData: FormData) => {
  const supabase = await getSupabaseServerClient();
  const parsed = promptFormSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
    category: formData.get('category'),
    tags: parseTags(formData.get('tags')),
    thumbnail_url: formData.get('thumbnail_url')
  });

  const { error } = await supabase
    .from('prompts')
    .update({
      title: parsed.title,
      content: parsed.content,
      category: parsed.category,
      tags: parsed.tags,
      thumbnail_url: parsed.thumbnail_url ?? null,
      updated_at: new Date().toISOString()
    })
    .eq('id', promptId);

  if (error) throw new Error(error.message);

  revalidatePath('/prompts');
  revalidatePath(`/prompts/${promptId}`);
  return { ok: true };
};

export const deletePromptAction = async (promptId: string) => {
  const supabase = await getSupabaseServerClient();
  const profile = await getProfile();
  await supabase.from('prompts').delete().eq('id', promptId);
  if (profile && profile.prompt_quota_used > 0) {
    await supabase
      .from('profiles')
      .update({ prompt_quota_used: Math.max(0, profile.prompt_quota_used - 1) })
      .eq('id', profile.id);
  }
  revalidatePath('/prompts');
  return { ok: true };
};

export const toggleFavoriteAction = async (promptId: string, value: boolean) => {
  await toggleFavorite(promptId, value);
  revalidatePath('/prompts');
};

export const trackPromptUsage = async (promptId: string) => {
  await incrementUseCount(promptId);
  revalidatePath('/prompts');
};

export const logImprovement = async (
  promptId: string,
  originalContent: string,
  improvedContent: string,
  diffJson: unknown
) => {
  const supabase = await getSupabaseServerClient();
  const profile = await getProfile();
  if (profile && hasReachedImproveLimit(profile.improvements_used_today)) {
    throw new Error('Has usado 5/5 mejoras hoy. Upgrade a Pro');
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase.from('prompt_improvements').insert({
    prompt_id: promptId,
    user_id: user.id,
    original_content: originalContent,
    improved_content: improvedContent,
    diff_json: diffJson,
    created_at: new Date().toISOString()
  });

  if (error) throw new Error(error.message);

  if (profile) {
    await supabase
      .from('profiles')
      .update({ improvements_used_today: profile.improvements_used_today + 1 })
      .eq('id', profile.id);
  }

  revalidatePath('/prompts');
};
