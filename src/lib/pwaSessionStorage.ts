/**
 * Session storage utility for PWA environments
 * 
 * NOTE: This file contains localStorage utilities for PWA session persistence.
 * The actual session hydration logic is handled by useSessionHydration hook.
 * These functions are kept for reference and potential future client-side usage.
 * 
 * Session storage keys:
 * - pps_session_data: Stores session with userId, email, tokens, and expiration
 * - pps_last_active_timestamp: Tracks last activity for session validity
 */

const SESSION_STORAGE_KEY = 'pps_session_data';
const LAST_ACTIVE_KEY = 'pps_last_active_timestamp';

/**
 * Clear session from localStorage (used during sign out)
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
