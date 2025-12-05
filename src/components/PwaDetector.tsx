'use client';

import { useEffect } from 'react';

/**
 * Detects if app is running in PWA standalone mode and sets a cookie
 * This allows server-side middleware to know it's a PWA without relying on unreliable headers
 */
export function PwaDetector() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if running in standalone mode (PWA)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Use Secure flag only in production (HTTPS)
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';

    if (isStandalone) {
      // Set a persistent cookie to indicate PWA mode
      // This cookie will be available to server-side middleware
      document.cookie = 
        `pwa_standalone=true; path=/; max-age=31536000; SameSite=Lax${secure}`; // 1 year
    } else {
      // Clear the cookie if not in standalone mode (browser mode)
      // This prevents stale state if user switches from PWA to browser
      document.cookie = 
        `pwa_standalone=; path=/; max-age=0; SameSite=Lax${secure}`;
    }
  }, []);

  return null; // This component doesn't render anything
}
