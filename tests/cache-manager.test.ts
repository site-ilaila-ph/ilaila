import { describe, expect, it } from "vitest";
import { acquireCacheManager } from "@/lib/live";

describe("CacheManager", () => {
  it("supports detached cached() calls without object context", async () => {
    const cache = acquireCacheManager();
    const detachedCached = cache.cached;

    const value = await detachedCached({
      key: ["regression", "detached-cached"],
      fn: async () => ({ ok: true, value: 42 }),
      ttlSeconds: 60,
    });

    expect(value).toEqual({ ok: true, value: 42 });
    expect(await cache.get({ key: ["regression", "detached-cached"] })).toEqual({ ok: true, value: 42 });
  });
});
