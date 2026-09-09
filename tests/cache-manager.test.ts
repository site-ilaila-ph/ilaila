import { describe, expect, it, vi } from "vitest";
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

  it("supports string keys, encoded array keys, and invalidation", async () => {
    const cache = acquireCacheManager();

    await cache.set({ key: "plain", value: { ok: true } });
    await cache.set({ key: ["folder/name", "item one"], value: 7 });

    expect(await cache.get({ key: "plain" })).toEqual({ ok: true });
    expect(await cache.get({ key: ["folder/name", "item one"] })).toBe(7);

    await cache.invalidate({ key: "plain" });
    expect(await cache.get({ key: "plain" })).toBeNull();
  });

  it("expires values and does not cache failed loads", async () => {
    vi.useFakeTimers();
    try {
      const cache = acquireCacheManager();
      await cache.set({ key: "expiring", value: "value", ttlSeconds: 5 });
      expect(await cache.get({ key: "expiring" })).toBe("value");

      vi.advanceTimersByTime(5001);
      expect(await cache.get({ key: "expiring" })).toBeNull();
      await expect(cache.cached({
        key: "failed",
        fn: async () => { throw new Error("load failed"); },
      })).rejects.toThrow("load failed");
      expect(await cache.get({ key: "failed" })).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("calls cached loaders once while a value is present", async () => {
    const cache = acquireCacheManager();
    const loader = vi.fn().mockResolvedValue("loaded");

    await expect(cache.cached({ key: "once", fn: loader })).resolves.toBe("loaded");
    await expect(cache.cached({ key: "once", fn: loader })).resolves.toBe("loaded");
    expect(loader).toHaveBeenCalledTimes(1);
  });
});
