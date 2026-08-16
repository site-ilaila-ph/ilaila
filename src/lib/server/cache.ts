import { after } from "next/server";
import { Redis } from "@upstash/redis";

export type CacheKey = string | string[];

export interface CacheLayer {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  remainingTtl(key: string): Promise<number>;
}

// #region Helpers
function formatKey({ key }: { key: CacheKey }): string {
  if (Array.isArray(key)) {
    return key.map(encodeURIComponent).join(":");
  }
  return key;
}

// Safe wrapper for Next.js `after()` or fire-and-forget fallback
function runInBackground({ task }: { task: () => Promise<unknown> }) {
  try {
    after(async () => {
      try {
        await task();
      } catch (err) {
        console.error("[Cache Background Task Error]", err);
      }
    });
  } catch {
    // Fallback if called outside Next.js request context (e.g., CLI / cron)
    task().catch((err) => console.error("[Cache Background Task Error]", err));
  }
}

// #endregion

// #region In-Memory
interface MemoryCacheEntry {
  value: unknown;
  expiresAt?: number;
}

interface MemoryCacheInstance {
  store: Map<string, MemoryCacheEntry>;
}

function memoryCacheReadEntry({
  self,
  key,
}: {
  self: MemoryCacheInstance;
  key: string;
}): MemoryCacheEntry | null {
  const item = self.store.get(key);
  if (!item) return null;

  if (item.expiresAt && Date.now() > item.expiresAt) {
    self.store.delete(key);
    return null;
  }

  return item;
}

async function memoryCacheGet<T>({
  self,
  key,
}: {
  self: MemoryCacheInstance;
  key: string;
}): Promise<T | null> {
  const item = memoryCacheReadEntry({ self, key });
  return item ? (item.value as T) : null;
}

async function memoryCacheSet({
  self,
  key,
  value,
  ttlSeconds,
}: {
  self: MemoryCacheInstance;
  key: string;
  value: unknown;
  ttlSeconds?: number;
}): Promise<void> {
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
  self.store.set(key, { value, expiresAt });
}

async function memoryCacheDelete({
  self,
  key,
}: {
  self: MemoryCacheInstance;
  key: string;
}): Promise<void> {
  self.store.delete(key);
}

async function memoryCacheRemainingTtl({
  self,
  key,
}: {
  self: MemoryCacheInstance;
  key: string;
}): Promise<number> {
  const item = memoryCacheReadEntry({ self, key });
  if (!item?.expiresAt) return 0;
  const ttl = Math.floor((item.expiresAt - Date.now()) / 1000);
  return ttl > 0 ? ttl : 0;
}

function createMemoryCache(): CacheLayer {
  const self: MemoryCacheInstance = { store: new Map() };

  return {
    get: (key) => memoryCacheGet({ self, key }),
    set: (key, value, ttlSeconds) => memoryCacheSet({ self, key, value, ttlSeconds }),
    delete: (key) => memoryCacheDelete({ self, key }),
    remainingTtl: (key) => memoryCacheRemainingTtl({ self, key }),
  };
}

// #endregion

// region Redis
interface RedisCacheInstance {
  client: Redis;
}

async function redisCacheGet<T>({
  self,
  key,
}: {
  self: RedisCacheInstance;
  key: string;
}): Promise<T | null> {
  const result = await self.client.get<T>(key);
  return result ?? null;
}

async function redisCacheSet({
  self,
  key,
  value,
  ttlSeconds,
}: {
  self: RedisCacheInstance;
  key: string;
  value: unknown;
  ttlSeconds?: number;
}): Promise<void> {
  if (ttlSeconds && ttlSeconds > 0) {
    await self.client.set(key, value, { ex: ttlSeconds });
  } else {
    await self.client.set(key, value);
  }
}

async function redisCacheDelete({
  self,
  key,
}: {
  self: RedisCacheInstance;
  key: string;
}): Promise<void> {
  await self.client.del(key);
}

async function redisCacheRemainingTtl({
  self,
  key,
}: {
  self: RedisCacheInstance;
  key: string;
}): Promise<number> {
  // Upstash TTL returns -1 (no expiry) or -2 (missing key) per Redis semantics
  const ttl = await self.client.ttl(key);
  return ttl > 0 ? ttl : 0;
}

function createRedisCache(): CacheLayer {
  const self: RedisCacheInstance = {
    client: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    }),
  };

  return {
    get: (key) => redisCacheGet({ self, key }),
    set: (key, value, ttlSeconds) => redisCacheSet({ self, key, value, ttlSeconds }),
    delete: (key) => redisCacheDelete({ self, key }),
    remainingTtl: (key) => redisCacheRemainingTtl({ self, key }),
  };
}

// #endregion

// #region Manager
interface CacheManagerInstance {
  l1: CacheLayer;
  l2: CacheLayer | null;
}

async function cacheManagerGet<T>({
  self,
  key,
}: {
  self: CacheManagerInstance;
  key: CacheKey;
}): Promise<T | null> {
  const k = formatKey({ key });

  // 1. Check L1 (fast, in-memory)
  const l1Result = await self.l1.get<T>(k);
  if (l1Result != null) return l1Result;

  // 2. Check L2, if present
  if (!self.l2) return null;

  const l2Result = await self.l2.get<T>(k);
  if (l2Result != null) {
    // Backfill L1 asynchronously using L2's remaining TTL for accurate promotion
    const ttl = await self.l2.remainingTtl(k);
    self.l1.set(k, l2Result, ttl > 0 ? ttl : undefined);
    return l2Result;
  }

  return null;
}

async function cacheManagerSet<T>({
  self,
  key,
  value,
  ttlSeconds,
}: {
  self: CacheManagerInstance;
  key: CacheKey;
  value: T;
  ttlSeconds?: number;
}): Promise<void> {
  const k = formatKey({ key });

  // Write to L1 immediately so current process / sub-requests hit it right away
  await self.l1.set(k, value, ttlSeconds);

  // Offload L2 write to background via Next.js `after()`, if L2 exists
  if (!self.l2) return;

  const l2 = self.l2;
  runInBackground({ task: () => l2.set(k, value, ttlSeconds) });
}

async function cacheManagerInvalidate({
  self,
  key,
}: {
  self: CacheManagerInstance;
  key: CacheKey;
}): Promise<void> {
  const k = formatKey({ key });
  await Promise.allSettled([
    self.l1.delete(k),
    self.l2 ? self.l2.delete(k) : Promise.resolve(),
  ]);
}

/**
 * Executes `fn` only on cache miss, storing result in L1 and L2.
 */
async function cacheManagerCached<T>({
  self,
  key,
  fn,
  ttlSeconds,
}: {
  self: CacheManagerInstance;
  key: CacheKey;
  fn: () => Promise<T>;
  ttlSeconds?: number;
}): Promise<T> {
  const cached = await cacheManagerGet<T>({ self, key });
  if (cached != null) return cached;

  const freshData = await fn();
  await cacheManagerSet({ self, key, value: freshData, ttlSeconds });

  return freshData;
}

export interface CacheManager {
  get<T>(params: { key: CacheKey }): Promise<T | null>;
  set<T>(params: { key: CacheKey; value: T; ttlSeconds?: number }): Promise<void>;
  invalidate(params: { key: CacheKey }): Promise<void>;
  cached<T>(params: { key: CacheKey; fn: () => Promise<T>; ttlSeconds?: number }): Promise<T>;
}

// #endregion
// #region Exports

export function acquireCacheManager(): CacheManager {
  const self: CacheManagerInstance = {
    l1: createMemoryCache(),
    l2: process.env.NODE_ENV == "production" ? createRedisCache() : null,
  };

  return {
    get: ({ key }) => cacheManagerGet({ self, key }),
    set: ({ key, value, ttlSeconds }) => cacheManagerSet({ self, key, value, ttlSeconds }),
    invalidate: ({ key }) => cacheManagerInvalidate({ self, key }),
    cached: ({ key, fn, ttlSeconds }) => cacheManagerCached({ self, key, fn, ttlSeconds }),
  };
}

// #endregion