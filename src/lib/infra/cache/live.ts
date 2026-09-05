import { Redis } from "@upstash/redis";
import { CacheLayer } from "./common";

export default function createLiveCache(): CacheLayer {
  const client = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
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