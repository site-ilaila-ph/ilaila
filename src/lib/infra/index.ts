import {
    createCacheManager,
    createMemoryCache,
    type CacheManager,
} from "./cache/common";
import liveCacheFactory from "./cache/live";
import { PrismaClient } from "@/generated/prisma/client";
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

export function acquireDb() {
    return acquirePrismaClient();
}

export function acquirePrismaClient() {
    globalForInfra.prisma ??= new PrismaClient({ adapter: new PrismaPg({}) });
    return globalForInfra.prisma;
}

export async function acquireNextJSCookieMap() {
    return new Map<string, string>();
}

export function acquireStorageManager(): StorageManager {
    globalForInfra.storageManager = createStorageManager({
        layer: liveStorageFactory(),
    });

    return globalForInfra.storageManager;
}

export type { CacheManager, StorageManager };