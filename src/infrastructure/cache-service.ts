import { injectable, inject } from "inversify";
import { TYPES } from "@/lib/types";
import { joinKey } from "@/utils/join-key";
import { after } from "next/server";
import { LRUCache } from "lru-cache";

export type CacheKey = string | string[];

export interface CacheLayer {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  remainingTtl(key: string): Promise<number>;
}



export interface CacheManager {
  get<T>(key: CacheKey): Promise<T | null>;
  set<T>(key: CacheKey, value: T, ttlSeconds?: number): Promise<void>;
  invalidate(key: CacheKey): Promise<void>;
  cached<T>(key: CacheKey, fn: () => Promise<T>, ttlSeconds?: number): Promise<T>;
}

@injectable()
export class MemoryCacheService implements CacheLayer {
  private cache = new LRUCache<string, object>({ max: 1000 });

  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get(key);
    return value === undefined ? null : (value as unknown as T);
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const stored = value as object;
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

@injectable()
export class CacheService implements CacheManager {
  constructor(
    @inject(TYPES.MemoryCache) private l1: CacheLayer,
    @inject(TYPES.UpstashCache) private l2: CacheLayer | null,
  ) {}

  private formatKey(key: CacheKey): string {
    return joinKey(key, ":");
  }

  private normalizeTtl(ttlSeconds?: number): number | undefined {
    if (typeof ttlSeconds !== "number" || ttlSeconds <= 0) return undefined;
    return ttlSeconds;
  }

  private async getRemainingTtl(layer: CacheLayer, key: string): Promise<number | undefined> {
    const ttl = await layer.remainingTtl(key);
    return ttl > 0 ? ttl : undefined;
  }

  async get<T>(key: CacheKey): Promise<T | null> {
    const k = this.formatKey(key);
    const l1Result = await this.l1.get<T>(k);
    if (l1Result != null) return l1Result;
    if (!this.l2) return null;
    const l2Result = await this.l2.get<T>(k);
    if (l2Result != null) {
      const ttl = await this.getRemainingTtl(this.l2, k);
      await this.l1.set(k, l2Result, ttl);
      return l2Result;
    }
    return null;
  }

  async set<T>(key: CacheKey, value: T, ttlSeconds?: number): Promise<void> {
    const k = this.formatKey(key);
    const ttl = this.normalizeTtl(ttlSeconds);
    await this.l1.set(k, value, ttl);
    if (!this.l2) return;
    after(() => this.l2!.set(k, value, ttl));
  }

  async invalidate(key: CacheKey): Promise<void> {
    const k = this.formatKey(key);
    await Promise.allSettled([this.l1.delete(k), this.l2 ? this.l2.delete(k) : Promise.resolve()]);
  }

  async cached<T>(key: CacheKey, fn: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const existing = await this.get<T>(key);
    if (existing != null) return existing;
    const freshData = await fn();
    await this.set(key, freshData, ttlSeconds);
    return freshData;
  }
}
