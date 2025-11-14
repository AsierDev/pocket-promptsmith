import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database, ProfileRow } from "@/types/supabase";
import { env } from "@/lib/env";

export const getSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database, "public">(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({
              name,
              value,
              ...options,
              path: options?.path ?? "/",
            });
          });
        },
      },
    }
  );
};

export const getSession = async () => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error retrieving session", error);
    return null;
  }
  return data.session;
};

const isNotFoundError = (error: PostgrestError | null) =>
  error?.code === "PGRST116";

const fetchProfile = async (): Promise<ProfileRow | null> => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (data) {
    return maybeResetDailyImprovements(supabase, data);
  }

  if (error && !isNotFoundError(error)) {
    console.error("Error fetching profile", error);
    throw new Error("No se pudo obtener tu perfil.");
  }

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? "",
      plan: "free",
      prompt_quota_used: 0,
      improvements_used_today: 0,
      improvements_reset_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (insertError) {
    console.error("Error creating profile", insertError);
    throw new Error("No se pudo inicializar tu perfil.");
  }

  return created ?? null;
};

export const getProfile = fetchProfile;

const maybeResetDailyImprovements = async (
  supabase: SupabaseClient<Database>,
  profile: ProfileRow
): Promise<ProfileRow> => {
  if (!shouldResetImprovements(profile.improvements_reset_at)) {
    return profile;
  }

  // Use type assertion to bypass TypeScript inference issue
  const { data, error } = await (supabase as any).rpc(
    "reset_daily_improvements",
    {
      target_user_id: profile.id,
    }
  );

  if (error) {
    console.error("Error resetting improvements quota", error);
    return profile;
  }

  return (
    data ?? {
      ...profile,
      improvements_used_today: 0,
      improvements_reset_at: new Date().toISOString(),
    }
  );
};
const shouldResetImprovements = (lastResetAt: string | null) => {
  if (!lastResetAt) return true;
  const lastResetDate = new Date(lastResetAt);
  if (Number.isNaN(lastResetDate.getTime())) return true;
  const now = new Date();
  return (
    lastResetDate.getUTCFullYear() !== now.getUTCFullYear() ||
    lastResetDate.getUTCMonth() !== now.getUTCMonth() ||
    lastResetDate.getUTCDate() !== now.getUTCDate()
  );
};
