'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { promptFormSchema } from '@/features/prompts/schemas';
import { incrementUseCount, toggleFavorite } from '@/features/prompts/services';
import { getSupabaseServerClient } from '@/lib/authUtils';
import { clearCacheEntry, clearAllCache } from '@/lib/cacheUtils';
import { hasReachedPromptLimit } from '@/lib/limits';
import { getProfile } from '@/lib/supabaseServer';

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
    summary: formData.get('summary'),
    content: formData.get('content'),
    category: formData.get('category'),
    tags: parseTags(formData.get('tags')),
    ai_improvement_source: formData.get('ai_improvement_source')
  });

  const aiImprovementSource = parsed.ai_improvement_source
    ? parsed.ai_improvement_source
    : '';

  const { error } = await supabase.from('prompts').insert({
    user_id: user.id,
    title: parsed.title,
    summary: parsed.summary ?? '',
    content: parsed.content,
    category: parsed.category,
    tags: parsed.tags,
    ai_improvement_source: aiImprovementSource ? aiImprovementSource : null
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
  // Clear cache after creating a new prompt
  clearAllCache();
  redirect('/prompts/dashboard');
};

export const updatePromptAction = async (
  promptId: string,
  formData: FormData
) => {
  const supabase = await getSupabaseServerClient();
  const parsed = promptFormSchema.parse({
    title: formData.get('title'),
    summary: formData.get('summary'),
    content: formData.get('content'),
    category: formData.get('category'),
    tags: parseTags(formData.get('tags')),
    ai_improvement_source: formData.get('ai_improvement_source')
  });

  const aiImprovementSource = parsed.ai_improvement_source
    ? parsed.ai_improvement_source
    : '';

  const { error } = await supabase
    .from('prompts')
    .update({
      title: parsed.title,
      summary: parsed.summary ?? '',
      content: parsed.content,
      category: parsed.category,
      tags: parsed.tags,
      ai_improvement_source: aiImprovementSource ? aiImprovementSource : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', promptId);

  if (error) throw new Error(error.message);

  revalidatePath('/prompts');
  revalidatePath(`/prompts/${promptId}`);
  // Clear cache after updating a prompt
  clearAllCache();
  redirect('/prompts/dashboard');
};

export const deletePromptAction = async (promptId: string) => {
  const supabase = await getSupabaseServerClient();
  const profile = await getProfile();
  const { error: deleteError } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (profile && profile.prompt_quota_used > 0) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ prompt_quota_used: Math.max(0, profile.prompt_quota_used - 1) })
      .eq('id', profile.id);

    if (profileError) {
      throw new Error(profileError.message);
    }
  }
  revalidatePath('/prompts');
  // Clear cache after deleting a prompt
  clearAllCache();
  return { ok: true };
};

export const toggleFavoriteAction = async (
  promptId: string,
  value: boolean
) => {
  await toggleFavorite(promptId, value);
  revalidatePath('/prompts');
  // Clear cache for this specific prompt and list
  clearCacheEntry(`prompt:${promptId}`);
  clearAllCache();
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

  revalidatePath('/prompts');
};
