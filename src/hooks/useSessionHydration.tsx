'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { Database } from '@/types/supabase';


/**
 * Hook to hydrate Supabase session from localStorage on PWA startup
 * This solves the issue where cookies may not persist on mobile PWA launches
 */
export function useSessionHydration() {
  const [isHydrating, setIsHydrating] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          setIsHydrating(false);
          setIsReady(true);
          return;
        }

        // Check if we have a stored session in localStorage
        const sessionDataStr = localStorage.getItem('pps_session_data');
        const lastActiveStr = localStorage.getItem('pps_last_active_timestamp');

        if (!sessionDataStr || !lastActiveStr) {
          setIsHydrating(false);
          setIsReady(true);
          return;
        }

        const sessionData = JSON.parse(sessionDataStr);
        const lastActiveTimestamp = parseInt(lastActiveStr);

        // Validate session is recent (within 24 hours)
        const isRecent = Date.now() - lastActiveTimestamp < 24 * 60 * 60 * 1000;
        const isValid =
          sessionData &&
          sessionData.userId &&
          sessionData.expiresAt &&
          Date.now() < sessionData.expiresAt;

        if (!isValid || !isRecent) {
          setIsHydrating(false);
          setIsReady(true);
          return;
        }

        // Get environment variables (client-safe)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('[PWA Session] Missing Supabase environment variables');
          setIsHydrating(false);
          setIsReady(true);
          return;
        }

        // Create a Supabase client and set the session
        const supabase = createBrowserClient<Database>(
          supabaseUrl,
          supabaseAnonKey
        );

        const { data, error } = await supabase.auth.setSession({
          access_token: sessionData.accessToken,
          refresh_token: sessionData.refreshToken
        });

        if (error) {
          console.error('[PWA Session] Failed to hydrate session:', error);
          // Clear invalid session data
          localStorage.removeItem('pps_session_data');
          localStorage.removeItem('pps_last_active_timestamp');
        } else if (data.session) {
          // Update last active timestamp
          localStorage.setItem('pps_last_active_timestamp', Date.now().toString());
          
          // Handle race condition with middleware
          // If we're on the login page with redirectTo, it means middleware redirected us
          // before hydration completed. Now that session is restored, redirect to intended page.
          const currentUrl = new URL(window.location.href);
          if (currentUrl.pathname === '/login' && currentUrl.searchParams.has('redirectTo')) {
            const redirectTo = currentUrl.searchParams.get('redirectTo');
            window.location.replace(redirectTo || '/prompts/dashboard');
            return; // Don't set isReady yet, we're redirecting
          }
        }
      } catch (error) {
        console.error('[PWA Session] Error during hydration:', error);
      } finally {
        setIsHydrating(false);
        setIsReady(true);
      }
    };

    hydrateSession();
  }, [router]);

  return { isHydrating, isReady };
}

