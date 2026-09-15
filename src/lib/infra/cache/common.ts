import { after } from "next/server";
import { LRUCache } from "lru-cache";
import { joinKey } from "../utils";

export type CacheKey = string | string[];

export interface CacheLayer {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  remainingTtl(key: string): Promise<number>;
}


// --- In-memory layer ---------------------------------------------------

export function createMemoryCache(options?: { max?: number }): CacheLayer {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  const cache = new LRUCache<string, {}>({ max: options?.max ?? 1000 });

  return {
    async get<T>(key: string): Promise<T | null> {
      const value = cache.get(key);
      return value === undefined ? null : (value as unknown as T);
    },
    async set(key, value, ttlSeconds) {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      const stored = value as {};
      if (typeof ttlSeconds === "number" && ttlSeconds > 0) {
        cache.set(key, stored, { ttl: ttlSeconds * 1000 });
      } else {
        cache.set(key, stored);
      }
    },
    async delete(key) {
      cache.delete(key);
    },
    async remainingTtl(key) {
      const ttlMs = cache.getRemainingTTL(key);
      if (ttlMs === undefined || ttlMs <= 0 || ttlMs === Infinity || Number.isNaN(ttlMs)) return 0;
      return Math.floor(ttlMs / 1000);
    },
  };
}


// --- Manager -------------------------------------------------------------

export interface CacheManager {
  get<T>(params: { key: CacheKey }): Promise<T | null>;
  set<T>(params: { key: CacheKey; value: T; ttlSeconds?: number }): Promise<void>;
  invalidate(params: { key: CacheKey }): Promise<void>;
  cached<T>(params: { key: CacheKey; fn: () => Promise<T>; ttlSeconds?: number }): Promise<T>;
}

export function createCacheManager({ l1, l2 }: { l1: CacheLayer; l2: CacheLayer | null }): CacheManager {
  const formatKey = (key: CacheKey) => joinKey(key, ":");
  const normalizeTtl = (ttlSeconds?: number): number | undefined => {
    if (typeof ttlSeconds !== "number" || ttlSeconds <= 0) return undefined;
    return ttlSeconds;
  };
  const getRemainingTtl = async (layer: CacheLayer, key: string): Promise<number | undefined> => {
    const ttl = await layer.remainingTtl(key);
    return ttl > 0 ? ttl : undefined;
  };

  const get = async <T>({ key }: { key: CacheKey }): Promise<T | null> => {
    const k = formatKey(key);

    const l1Result = await l1.get<T>(k);
    if (l1Result != null) return l1Result;

    if (!l2) return null;

    const l2Result = await l2.get<T>(k);
    if (l2Result != null) {
      // Backfill L1 using L2's remaining TTL so promotion doesn't outlive the source
      const ttl = await getRemainingTtl(l2, k);
      await l1.set(k, l2Result, ttl);
      return l2Result;
    }

    return null;
  };

  const set = async ({ key, value, ttlSeconds }: { key: CacheKey; value: unknown; ttlSeconds?: number }) => {
    const k = formatKey(key);
    const ttl = normalizeTtl(ttlSeconds);

    // Write L1 immediately so the current process sees it right away
    await l1.set(k, value, ttl);

    // L2 write happens in the background, if present
    if (!l2) return;
    after(() => l2.set(k, value, ttl));
  };

  const invalidate = async ({ key }: { key: CacheKey }) => {
    const k = formatKey(key);
    await Promise.allSettled([l1.delete(k), l2 ? l2.delete(k) : Promise.resolve()]);
  };

  const cached = async <T>({ key, fn, ttlSeconds }: { key: CacheKey; fn: () => Promise<T>; ttlSeconds?: number }): Promise<T> => {
    const existing = await get<T>({ key });
    if (existing != null) return existing;

    const freshData = await fn();
    await set({ key, value: freshData, ttlSeconds });
    return freshData;
  };

  return {
    get,
    set,
    invalidate,
    cached,
  };
}