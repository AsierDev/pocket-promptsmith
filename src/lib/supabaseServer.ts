import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerClient, getSession } from '@/lib/authUtils';
import { shouldResetDaily } from '@/lib/dateUtils';
import type { Database, ProfileRow } from '@/types/supabase';

const isNotFoundError = (error: PostgrestError | null) =>
  error?.code === 'PGRST116';

const fetchProfile = async (): Promise<ProfileRow | null> => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Use transaction-based approach to prevent race conditions
  try {
    // First attempt: try to fetch existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return maybeResetDailyImprovements(supabase, existingProfile);
    }

    if (fetchError && !isNotFoundError(fetchError)) {
      console.error('Unexpected error fetching profile:', fetchError);
      throw new Error('Could not verify profile existence');
    }

    // If no profile exists, use upsert to prevent race conditions
    const { data: profile, error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email ?? '',
        plan: 'free',
        prompt_quota_used: 0,
        improvements_used_today: 0,
        improvements_reset_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (upsertError) {
      console.error('Error in profile upsert operation:', upsertError);
      throw new Error(
        `Could not create or retrieve your profile: ${upsertError.message}`
      );
    }

    return maybeResetDailyImprovements(supabase, profile);
  } catch (error) {
    console.error('Critical error in profile handling:', error);
    // Fallback to retry mechanism if upsert fails
    const fallbackProfile = await fetchProfileWithRetry(supabase, user.id);
    if (fallbackProfile) {
      return maybeResetDailyImprovements(supabase, fallbackProfile);
    }
    throw new Error(
      'Failed to initialize your profile after multiple attempts'
    );
  }
};

const fetchProfileWithRetry = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  maxRetries = 3,
  retryDelay = 100
): Promise<ProfileRow | null> => {
  let lastError: PostgrestError | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        return data;
      }

      if (error && !isNotFoundError(error)) {
        lastError = error;
        console.error(`Attempt ${attempt}: Error fetching profile`, error);
      }

      // Wait before retrying to allow database consistency
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      }
    } catch (error) {
      lastError = error as PostgrestError;
      console.error(
        `Attempt ${attempt}: Unexpected error fetching profile`,
        error
      );
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      }
    }
  }

  if (lastError) {
    console.error('Max retries reached. Last error:', lastError);
  }
  return null;
};

export const getProfile = fetchProfile;

const maybeResetDailyImprovements = async (
  supabase: SupabaseClient<Database>,
  profile: ProfileRow
): Promise<ProfileRow> => {
  if (!shouldResetDaily(profile.improvements_reset_at)) {
    return profile;
  }

  // Use type assertion to bypass TypeScript inference issue
  const { data, error } = await (supabase as any).rpc(
    'reset_daily_improvements',
    {
      target_user_id: profile.id
    }
  );

  if (error) {
    console.error('Error resetting improvements quota', error);
    return profile;
  }

  return (
    data ?? {
      ...profile,
      improvements_used_today: 0,
      improvements_reset_at: new Date().toISOString()
    }
  );
};
