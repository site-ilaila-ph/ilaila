// live.ts (live components, is real infra.)

import { after } from "next/server";
import { cookies } from "next/headers";
import { Redis } from "@upstash/redis";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import {
  put,
  del,
  head,
  list,
  type PutBlobResult,
  type ListBlobResult,
  type HeadBlobResult,
} from "@vercel/blob";

// =============================================================================
// Defer (thin wrapper around Next.js `after()`)
// =============================================================================

export function defer({ fn }: { fn: () => void | Promise<void> }): void {
  after(() => fn());
}

function joinKey(key: string | string[], separator: string): string {
  return Array.isArray(key) ? key.map(encodeURIComponent).join(separator) : key;
}

// =============================================================================
// Cache (two-tier: in-memory L1 + optional Redis L2)
// =============================================================================

export type CacheKey = string | string[];

export interface CacheLayer {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  remainingTtl(key: string): Promise<number>;
}

// --- In-memory layer ---------------------------------------------------

function createMemoryCache(): CacheLayer {
  interface Entry {
    value: unknown;
    expiresAt?: number;
  }
  const store = new Map<string, Entry>();

  function readEntry(key: string): Entry | null {
    const item = store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      store.delete(key);
      return null;
    }
    return item;
  }

  return {
    async get<T>(key: string): Promise<T | null> {
      const item = readEntry(key);
      return item ? (item.value as T) : null;
    },
    async set(key, value, ttlSeconds) {
      const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
      store.set(key, { value, expiresAt });
    },
    async delete(key) {
      store.delete(key);
    },
    async remainingTtl(key) {
      const item = readEntry(key);
      if (!item?.expiresAt) return 0;
      const ttl = Math.floor((item.expiresAt - Date.now()) / 1000);
      return ttl > 0 ? ttl : 0;
    },
  };
}

// --- Redis (Upstash) layer ---------------------------------------------

function createRedisCache(): CacheLayer {
  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  return {
    async get<T>(key: string): Promise<T | null> {
      const result = await client.get<T>(key);
      return result ?? null;
    },
    async set(key, value, ttlSeconds) {
      if (ttlSeconds && ttlSeconds > 0) {
        await client.set(key, value, { ex: ttlSeconds });
      } else {
        await client.set(key, value);
      }
    },
    async delete(key) {
      await client.del(key);
    },
    async remainingTtl(key) {
      // Upstash TTL returns -1 (no expiry) or -2 (missing key) per Redis semantics
      const ttl = await client.ttl(key);
      return ttl > 0 ? ttl : 0;
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

export function acquireCacheManager(): CacheManager {
  const l1 = createMemoryCache();
  const l2: CacheLayer | null = process.env.NODE_ENV === "production" ? createRedisCache() : null;

  const formatKey = (key: CacheKey) => joinKey(key, ":");

  return {
    async get<T>({ key }: { key: CacheKey }): Promise<T | null> {
      const k = formatKey(key);

      const l1Result = await l1.get<T>(k);
      if (l1Result != null) return l1Result;

      if (!l2) return null;

      const l2Result = await l2.get<T>(k);
      if (l2Result != null) {
        // Backfill L1 using L2's remaining TTL so promotion doesn't outlive the source
        const ttl = await l2.remainingTtl(k);
        await l1.set(k, l2Result, ttl > 0 ? ttl : undefined);
        return l2Result;
      }

      return null;
    },

    async set({ key, value, ttlSeconds }) {
      const k = formatKey(key);

      // Write L1 immediately so the current process sees it right away
      await l1.set(k, value, ttlSeconds);

      // L2 write happens in the background, if present
      if (!l2) return;
      defer({ fn: () => l2.set(k, value, ttlSeconds) });
    },

    async invalidate({ key }) {
      const k = formatKey(key);
      await Promise.allSettled([l1.delete(k), l2 ? l2.delete(k) : Promise.resolve()]);
    },

    async cached<T>({ key, fn, ttlSeconds }: { key: CacheKey; fn: () => Promise<T>; ttlSeconds?: number }): Promise<T> {
      const cached = await this.get<T>({ key });
      if (cached != null) return cached;

      const freshData = await fn();
      await this.set({ key, value: freshData, ttlSeconds });
      return freshData;
    },
  };
}

// =============================================================================
// Cookies
// =============================================================================

export interface CookieMap {
  get(key: string): string | null;
  has(key: string): boolean;
  set(key: string, value: string, options?: Parameters<ReadonlyRequestCookies["set"]>[2]): void;
  delete(key: string): void;
}

export async function acquireNextJSCookieMap(): Promise<CookieMap> {
  const cookieStore = await cookies();

  return {
    get(key) {
      return cookieStore.get(key)?.value ?? null;
    },
    has(key) {
      return cookieStore.has(key);
    },
    set(key, value, options) {
      cookieStore.set(key, value, options);
    },
    delete(key) {
      cookieStore.delete(key);
    },
  };
}

// =============================================================================
// Database (Prisma, singleton across hot reloads)
// =============================================================================

const globalForPrisma = globalThis as unknown as { db: PrismaClient | undefined };

export function acquireDb(): PrismaClient {
  if (globalForPrisma.db) return globalForPrisma.db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  globalForPrisma.db = db;
  return db;
}

// =============================================================================
// Blob storage (Vercel Blob + in-memory fallback for local dev)
// =============================================================================

export type StorageKey = string | string[];

export interface StorageLayer {
  upload(
    key: string,
    fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream,
    options?: Parameters<typeof put>[2]
  ): Promise<PutBlobResult>;
  get(key: string): Promise<HeadBlobResult | null>;
  delete(key: string): Promise<void>;
  list(options?: Parameters<typeof list>[0]): Promise<ListBlobResult>;
}

// --- In-memory layer (dev/test without live Vercel Blob credentials) ---

function createMemoryStorage(): StorageLayer {
  interface Entry {
    url: string;
    pathname: string;
    size: number;
    uploadedAt: Date;
    contentType?: string;
    body: Uint8Array;
  }
  const store = new Map<string, Entry>();

  async function toBytes(
    fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream
  ): Promise<Uint8Array> {
    if (typeof fileOrBody === "string") return new TextEncoder().encode(fileOrBody);
    if (fileOrBody instanceof ArrayBuffer) return new Uint8Array(fileOrBody);
    if (fileOrBody instanceof Blob) return new Uint8Array(await fileOrBody.arrayBuffer());
    // ReadableStream isn't supported by this in-memory mock; store empty body.
    return new Uint8Array(0);
  }

  return {
    async upload(key, fileOrBody, options) {
      const body = await toBytes(fileOrBody);
      const entry: Entry = {
        url: `https://memory-storage.local/${key}`,
        pathname: key,
        size: body.length,
        uploadedAt: new Date(),
        contentType: options?.contentType,
        body,
      };
      store.set(key, entry);

      return {
        url: entry.url,
        downloadUrl: entry.url,
        pathname: entry.pathname,
        contentType: entry.contentType ?? "application/octet-stream",
        contentDisposition: `attachment; filename="${key}"`,
        etag: "memory-etag",
      };
    },

    async get(key) {
      const item = store.get(key);
      if (!item) return null;

      return {
        url: item.url,
        downloadUrl: item.url,
        pathname: item.pathname,
        size: item.size,
        uploadedAt: item.uploadedAt,
        contentType: item.contentType ?? "application/octet-stream",
        contentDisposition: `attachment; filename="${key}"`,
        cacheControl: "max-age=0",
        etag: "memory-etag",
      };
    },

    async delete(key) {
      store.delete(key);
    },

    async list(options) {
      const prefix = options?.prefix;
      const entries = Array.from(store.values()).filter(
        (item) => !prefix || item.pathname.startsWith(prefix)
      );

      return {
        blobs: entries.map((item) => ({
          url: item.url,
          downloadUrl: item.url,
          pathname: item.pathname,
          size: item.size,
          uploadedAt: item.uploadedAt,
          etag: "memory-etag",
        })),
        hasMore: false,
      };
    },
  };
}

// --- Vercel Blob layer ---------------------------------------------------

function createVercelBlobStorage(): StorageLayer {
  return {
    async upload(key, fileOrBody, options) {
      return await put(key, fileOrBody, { access: "public", ...options });
    },
    async get(key) {
      try {
        return await head(key);
      } catch {
        return null;
      }
    },
    async delete(key) {
      await del(key);
    },
    async list(options) {
      return await list(options);
    },
  };
}

// --- Manager ---------------------------------------------------------------

export interface StorageManager {
  upload(params: {
    key: StorageKey;
    fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream;
    options?: Parameters<typeof put>[2];
  }): Promise<PutBlobResult>;
  get(params: { key: StorageKey }): Promise<HeadBlobResult | null>;
  delete(params: { key: StorageKey }): Promise<void>;
  list(options?: Parameters<typeof list>[0]): Promise<ListBlobResult>;
}

export function acquireStorageManager(): StorageManager {
  const useMemory = process.env.NODE_ENV !== "production" && !process.env.BLOB_READ_WRITE_TOKEN;
  const layer = useMemory ? createMemoryStorage() : createVercelBlobStorage();

  const formatKey = (key: StorageKey) => joinKey(key, "/");

  return {
    upload: ({ key, fileOrBody, options }) => layer.upload(formatKey(key), fileOrBody, options),
    get: ({ key }) => layer.get(formatKey(key)),
    delete: ({ key }) => layer.delete(formatKey(key)),
    list: (options) => layer.list(options),
  };
}