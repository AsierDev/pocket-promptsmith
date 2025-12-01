interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const cache = new Map<string, CacheEntry<any>>();

export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000 // 1 hour
};

export const getCachedData = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data;
};

export const setCachedData = <T>(key: string, data: T, ttl: number): void => {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl
  };
  cache.set(key, entry);
};

export const clearCacheEntry = (key: string): void => {
  cache.delete(key);
};

export const clearAllCache = (): void => {
  cache.clear();
};

export const generateCacheKey = (
  prefix: string,
  params: Record<string, any>
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join('|');
  return `${prefix}:${sortedParams}`;
};
