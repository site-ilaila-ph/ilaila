import {
    createCacheManager,
    createMemoryCache,
    type CacheManager,
} from "./cache/common";
import liveCacheFactory from "./cache/live";
import { PrismaClient } from "@/generated/prisma/client";
import { acquireNextJSCookieMap, type CookieMap } from "./framework/cookies";
import defer from "./framework/defer";
import { createStorageManager, type StorageManager } from "./storage/common";
import liveStorageFactory from "./storage/live";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForInfra = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    cacheManager: CacheManager | undefined;
    storageManager: StorageManager | undefined;

};

export function acquireCacheManager(): CacheManager {
    globalForInfra.cacheManager ??= createCacheManager({
        l1: createMemoryCache(),
        l2: process.env.NODE_ENV === "production" ? liveCacheFactory() : null,
    });

    return globalForInfra.cacheManager;
}

export function acquirePrismaClient() {
    globalForInfra.prisma ??= new PrismaClient({ adapter: new PrismaPg({}) });
    return globalForInfra.prisma;
}

export function acquireStorageManager(): StorageManager {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("BLOB_READ_WRITE_TOKEN is not set. Persistent image storage is required.");
    }

    globalForInfra.storageManager ??= createStorageManager({
        layer: liveStorageFactory(),
    });

    return globalForInfra.storageManager;
}

export { acquireNextJSCookieMap, defer };
export type { CacheManager, CookieMap, StorageManager };