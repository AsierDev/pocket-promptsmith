'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { env } from '@/lib/env';

export const supabaseBrowserClient = () =>
  createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
