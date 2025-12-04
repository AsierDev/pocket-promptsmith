import type { Session, User } from '@supabase/supabase-js';

export interface SessionData {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const DEFAULT_EXPIRY_MS = 3600000; // 1 hour in milliseconds

export function normalizeExpiresAt(expiresAt?: number | string): number {
  if (!expiresAt) {
    return Date.now() + DEFAULT_EXPIRY_MS;
  }

  if (typeof expiresAt === 'number') {
    return expiresAt * 1000;
  }

  return new Date(expiresAt).getTime();
}

export function processAuthSession(session: Session, user: User): SessionData {
  return {
    userId: user.id,
    email: user.email ?? '',
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: normalizeExpiresAt(session.expires_at)
  };
}
