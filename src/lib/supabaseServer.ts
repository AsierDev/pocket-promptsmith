import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { Database, ProfileRow } from '@/types/supabase';
import { getSupabaseServerClient, getSession } from '@/lib/authUtils';
import { shouldResetDaily } from '@/lib/dateUtils';

const isNotFoundError = (error: PostgrestError | null) =>
  error?.code === 'PGRST116';

const fetchProfile = async (): Promise<ProfileRow | null> => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (data) {
    return maybeResetDailyImprovements(supabase, data);
  }

  if (error && !isNotFoundError(error)) {
    console.error('Error fetching profile', error);
    throw new Error('Could not fetch your profile.');
  }

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email ?? '',
      plan: 'free',
      prompt_quota_used: 0,
      improvements_used_today: 0,
      improvements_reset_at: new Date().toISOString()
    })
    .select('*')
    .single();

  if (insertError) {
    console.error('Error creating profile', insertError);
    throw new Error('Could not initialize your profile.');
  }

  return created ?? null;
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
