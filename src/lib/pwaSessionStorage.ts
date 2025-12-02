'use server';

import { cookies } from 'next/headers';
import { getSupabaseServerClient } from './authUtils';

/**
 * Session storage utility for PWA environments
 * Handles session persistence across PWA launches using both cookies and localStorage
 */

const SESSION_STORAGE_KEY = 'pps_session_data';
const LAST_ACTIVE_KEY = 'pps_last_active_timestamp';

/**
 * Store session data in localStorage for PWA persistence
 */
export const storeSessionInLocalStorage = async (sessionData: {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}) => {
  if (typeof window !== 'undefined') {
    try {
      const sessionWithMetadata = {
        ...sessionData,
        storedAt: Date.now(),
        source: 'pwa_session'
      };

      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(sessionWithMetadata)
      );
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      return true;
    } catch (error) {
      console.error('Failed to store session in localStorage:', error);
      return false;
    }
  }
  return false;
};

/**
 * Retrieve session from localStorage with validation
 */
export const getSessionFromLocalStorage = (): {
  session: any;
  isValid: boolean;
  isRecent: boolean;
} | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);

    if (!sessionData || !lastActive) {
      return null;
    }

    const parsedSession = JSON.parse(sessionData);
    const lastActiveTimestamp = parseInt(lastActive);

    // Validate session is recent (within 24 hours)
    const isRecent = Date.now() - lastActiveTimestamp < 24 * 60 * 60 * 1000;
    const isValid =
      parsedSession &&
      parsedSession.userId &&
      parsedSession.expiresAt &&
      Date.now() < parsedSession.expiresAt;

    return {
      session: parsedSession,
      isValid,
      isRecent
    };
  } catch (error) {
    console.error('Failed to retrieve session from localStorage:', error);
    return null;
  }
};

/**
 * Clear session from localStorage
 */
export const clearSessionFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(LAST_ACTIVE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear session from localStorage:', error);
      return false;
    }
  }
  return false;
};

/**
 * Hybrid session check that combines cookie and localStorage checks
 * Designed specifically for PWA environments
 */
export const getHybridSession = async () => {
  // First, try the standard cookie-based approach
  const supabase = await getSupabaseServerClient();

  try {
    const { data, error } = await supabase.auth.getUser();

    if (data?.user) {
      // Session found via cookies - this is the ideal case
      return {
        user: data.user,
        source: 'cookies',
        isFresh: true
      };
    }

    // If no cookie session, check localStorage for PWA persistence
    const localSession = getSessionFromLocalStorage();

    if (localSession?.isValid && localSession?.isRecent) {
      // Try to refresh the session using the stored tokens
      try {
        const { data: refreshedData, error: refreshError } =
          await supabase.auth.setSession({
            access_token: localSession.session.accessToken,
            refresh_token: localSession.session.refreshToken
          });

        if (refreshedData?.user) {
          // Successfully refreshed session from localStorage
          return {
            user: refreshedData.user,
            source: 'localStorage_refreshed',
            isFresh: false
          };
        }
      } catch (refreshError) {
        console.error(
          'Failed to refresh session from localStorage:',
          refreshError
        );
      }
    }
  } catch (error) {
    console.error('Error in hybrid session check:', error);
  }

  return null;
};

/**
 * Update last active timestamp to keep session alive
 */
export const updateLastActiveTimestamp = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to update last active timestamp:', error);
    }
  }
};
