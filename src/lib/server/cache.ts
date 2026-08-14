import config from "@/config/caching";
import { after } from "next/server";

export type CacheKey = string | string[];

export interface CacheLayer {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  remainingTtl(key: string): number;
}

export interface CachingConfig {
  l1: CacheLayer;
  l2: CacheLayer;
}

// Helper to normalize keys consistently everywhere
function formatKey(key: CacheKey): string {
  if (Array.isArray(key)) {
    return key.map(encodeURIComponent).join(":");
  }
  return key;
}

// Safe wrapper for Next.js `after()` or fire-and-forget fallback
function runInBackground(task: () => Promise<unknown>) {
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

export async function get<T>(key: CacheKey): Promise<T | null> {
  const k = formatKey(key);

  // 1. Check L1 (Fast In-Memory)
  const l1Result = await config.l1.get<T>(k);
  if (l1Result != null) return l1Result;

  // 2. Check L2
  const l2Result = await config.l2.get<T>(k);

  if (l2Result != null) {
    // Backfill L1 asynchronously using L2's remaining TTL for accurate promotion
    const ttl = config.l2.remainingTtl(k);
    config.l1.set(k, l2Result, ttl > 0 ? ttl : undefined);
    return l2Result;
  }

  return null;
}

export async function set<T>(
  key: CacheKey,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  const k = formatKey(key);

  // Write to L1 immediately so current process / sub-requests hit it right away
  await config.l1.set(k, value, ttlSeconds);

  // Offload L2 write to background via Next.js `after()`
  runInBackground(() => config.l2.set(k, value, ttlSeconds));
}

export async function invalidate(key: CacheKey): Promise<void> {
  const k = formatKey(key);

  // Evict both L1 and L2 concurrently
  await Promise.allSettled([
    config.l1.delete(k),
    config.l2.delete(k),
  ]);
}

// ============================================================================
// 2. CACHED OPERATIONS (Higher-Order / Function Wrappers)
// ============================================================================

interface CacheOpOptions<T> {
  key: CacheKey;
  fn: () => Promise<T>;
  ttlSeconds?: number;
}

/**
 * Executes `fn` only on cache miss, storing result in L1 and L2.
 */
export async function cache<T>({ key, fn, ttlSeconds }: CacheOpOptions<T>): Promise<T> {
  // Check primitives first
  const cached = await get<T>(key);
  if (cached != null) return cached;

  // Cache miss -> execute operation
  const freshData = await fn();

  // Store using set primitive
  await set(key, freshData, ttlSeconds);

  return freshData;
}