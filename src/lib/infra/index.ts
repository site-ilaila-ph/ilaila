import {
    createCacheManager,
    createMemoryCache,
    type CacheManager,
} from "./cache/common";
import liveCacheFactory from "./cache/live";
import dbFactory from "./db/factory";
import { acquireNextJSCookieMap, type CookieMap } from "./framework/cookies";
import defer from "./framework/defer";
import { createStorageManager, type StorageManager } from "./storage/common";
import devStorageFactory from "./storage/dev";
import liveStorageFactory from "./storage/live";

const cacheManager = createCacheManager({
    l1: createMemoryCache(),
    l2: process.env.NODE_ENV === "production" ? liveCacheFactory() : null,
});

const storageManager = createStorageManager({
    layer:
        process.env.NODE_ENV !== "production" && !process.env.BLOB_READ_WRITE_TOKEN
            ? devStorageFactory()
            : liveStorageFactory(),
});

export function acquireCacheManager(): CacheManager {
    return cacheManager;
}

export function acquireDb() {
    return dbFactory();
}

export function acquireStorageManager(): StorageManager {
    return storageManager;
}

export { acquireNextJSCookieMap, defer };
export type { CacheManager, CookieMap, StorageManager };