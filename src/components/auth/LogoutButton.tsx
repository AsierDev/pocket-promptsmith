'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/features/auth/actions';
import { clearSessionFromLocalStorage } from '@/lib/pwaSessionStorage';

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton = ({ className = '' }: LogoutButtonProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      // Clear client-side session storage first
      clearSessionFromLocalStorage();

      // Then call server action
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback: redirect manually if server action fails
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`text-xs font-semibold text-slate-500 transition hover:text-primary dark:text-slate-400 disabled:opacity-60 ${className}`}
      aria-busy={isLoggingOut}
    >
      {isLoggingOut ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-3 w-3 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="sr-only">Cerrando sesión</span>
          Saliendo...
        </span>
      ) : (
        'Salir'
      )}
    </button>
  );
};
