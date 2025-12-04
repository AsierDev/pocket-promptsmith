interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  lastAccessed: number; // For LRU eviction
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

const cache = new Map<string, CacheEntry<any>>();
const MAX_CACHE_SIZE = 100;
let stats: CacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };

export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000 // 1 hour
};

/**
 * Cleans up expired entries and enforces cache size limits
 * Uses LRU (Least Recently Used) eviction when size limit is exceeded
 */
const cleanupCache = (): void => {
  const now = Date.now();
  let evictedCount = 0;

  // Remove expired entries first
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
      evictedCount++;
    }
  }

  // If still over limit, remove least recently used entries
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    const toRemove = cache.size - MAX_CACHE_SIZE;
    for (let i = 0; i < toRemove; i++) {
      cache.delete(entries[i][0]);
      evictedCount++;
    }
  }

  stats.evictions += evictedCount;
  stats.size = cache.size;
};

export const getCachedData = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) {
    stats.misses++;
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    stats.misses++;
    stats.size = cache.size;
    return null;
  }

  // Update last accessed time for LRU
  entry.lastAccessed = now;
  stats.hits++;
  
  return entry.data;
};

export const setCachedData = <T>(key: string, data: T, ttl: number): void => {
  // Clean up if cache is at capacity
  if (cache.size >= MAX_CACHE_SIZE) {
    cleanupCache();
  }

  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    timestamp: now,
    ttl,
    lastAccessed: now
  };
  
  cache.set(key, entry);
  stats.size = cache.size;
};

export const clearCacheEntry = (key: string): void => {
  cache.delete(key);
  stats.size = cache.size;
};

export const clearAllCache = (): void => {
  cache.clear();
  stats = { hits: 0, misses: 0, evictions: 0, size: 0 };
};

export const getCacheStats = (): Readonly<CacheStats> => {
  return { ...stats };
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
