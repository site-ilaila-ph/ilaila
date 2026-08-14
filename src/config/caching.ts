import type { CachingConfig } from "@/lib/server/cache";
import MemoryCache from "@/lib/server/memory-cache";
import RedisCache from "@/lib/server/redis-cache";

const cachingConfig: CachingConfig =  {
    l1: new MemoryCache(),
    l2: new RedisCache()
};

export default cachingConfig;