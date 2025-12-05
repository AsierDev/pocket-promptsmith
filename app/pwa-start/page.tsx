'use client';

import { useEffect, useState } from 'react';

/**
 * PWA Start Page - Landing page for PWA installations
 * 
 * This page solves the race condition between server-side middleware (proxy.ts)
 * and client-side session restoration (SessionHydration).
 * 
 * Flow:
 * 1. PWA opens with start_url="/pwa-start" (unprotected route)
 * 2. This client-side page checks localStorage for valid session
 * 3. If valid: sets cookies for server, redirects to /prompts/dashboard
 * 4. If invalid: redirects to /login
 * 
 * This ensures cookies are set BEFORE navigating to protected routes,
 * so proxy.ts will see them and allow access.
 */
export default function PwaStartPage() {
  const [status, setStatus] = useState('Verificando sesión...');

  useEffect(() => {
    const initializePwa = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          return;
        }

        // Set PWA standalone cookie
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `pwa_standalone=true; path=/; max-age=31536000; SameSite=Lax${secure}`;

        // Check localStorage for session
        const sessionDataStr = localStorage.getItem('pps_session_data');
        const lastActiveStr = localStorage.getItem('pps_last_active_timestamp');

        if (!sessionDataStr || !lastActiveStr) {
          setStatus('No hay sesión guardada, redirigiendo al login...');
          // Small delay so user sees the status
          await new Promise(resolve => setTimeout(resolve, 300));
          window.location.replace('/login');
          return;
        }

        const sessionData = JSON.parse(sessionDataStr);
        const lastActiveTimestamp = parseInt(lastActiveStr);
        const now = Date.now();

        // Validate session is recent (within 24 hours) and not expired
        const isRecent = now - lastActiveTimestamp < 24 * 60 * 60 * 1000;
        const isValid =
          sessionData &&
          sessionData.userId &&
          sessionData.expiresAt &&
          now < sessionData.expiresAt;

        if (!isValid || !isRecent) {
          setStatus('Sesión expirada, redirigiendo al login...');
          // Clear invalid session data
          localStorage.removeItem('pps_session_data');
          localStorage.removeItem('pps_last_active_timestamp');
          await new Promise(resolve => setTimeout(resolve, 300));
          window.location.replace('/login');
          return;
        }

        setStatus('Sesión válida, cargando aplicación...');

        // Set the session cookie for server-side middleware
        const maxAgeSeconds = Math.floor((sessionData.expiresAt - now) / 1000);
        if (maxAgeSeconds > 0) {
          document.cookie = `pps_has_session=true; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
        }

        // Update last active timestamp
        localStorage.setItem('pps_last_active_timestamp', now.toString());

        // Navigate to protected route - now server will see our cookies
        window.location.replace('/prompts/dashboard');

      } catch (error) {
        console.error('[PWA Start] Error during initialization:', error);
        setStatus('Error al iniciar, redirigiendo al login...');
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.replace('/login');
      }
    };

    initializePwa();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="text-sm text-slate-600 dark:text-slate-400">{status}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">Pocket Promptsmith</p>
      </div>
    </div>
  );
}
