'use client';

import { useSessionHydration } from '@/hooks/useSessionHydration';

/**
 * Component that handles PWA session hydration
 * Must be placed in the root layout to run before any protected routes
 */
export function SessionHydration({ children }: { children: React.ReactNode }) {
  const { isHydrating } = useSessionHydration();

  // Show a minimal loading state while hydrating to prevent flash of login page
  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
