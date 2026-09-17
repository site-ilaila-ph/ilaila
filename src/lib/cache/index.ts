import { singleton } from "../singleton";
import { type CacheManager, createCacheManager, createMemoryCache } from "./common";
import liveCacheFactory from "./live";


export function acquireCacheManager(): CacheManager {
    return singleton('cache', () => createCacheManager({
        l1: createMemoryCache(),
        l2: process.env.NODE_ENV === "production" ? liveCacheFactory() : null,
    }));
}
