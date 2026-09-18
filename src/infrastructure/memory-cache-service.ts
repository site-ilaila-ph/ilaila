import { injectable } from "inversify";
import { LRUCache } from "lru-cache";

export interface MemoryCacheLayer {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  remainingTtl(key: string): Promise<number>;
}

@injectable()
export class MemoryCacheService implements MemoryCacheLayer {
  private cache = new LRUCache<string, Record<never, never>>({ max: 1000 });

  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get(key);
    return value === undefined ? null : (value as unknown as T);
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const stored = value as Record<never, never>;
    if (typeof ttlSeconds === "number" && ttlSeconds > 0) {
      this.cache.set(key, stored, { ttl: ttlSeconds * 1000 });
    } else {
      this.cache.set(key, stored);
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async remainingTtl(key: string): Promise<number> {
    const ttlMs = this.cache.getRemainingTTL(key);
    if (ttlMs === undefined || ttlMs <= 0 || ttlMs === Infinity || Number.isNaN(ttlMs)) return 0;
    return Math.floor(ttlMs / 1000);
  }
}
