import { beforeEach, describe, expect, it, vi } from "vitest";
import { defer } from "@/lib/live";

const { after } = vi.hoisted(() => ({ after: vi.fn() }));
vi.mock("next/server", () => ({ after }));

describe("defer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("registers a callback with Next.js", () => {
    defer({ fn: vi.fn() });
    expect(after).toHaveBeenCalledOnce();
    expect(after.mock.calls[0][0]).toEqual(expect.any(Function));
  });

  it("executes the original callback when the registered callback runs", async () => {
    const callback = vi.fn().mockResolvedValue(undefined);
    defer({ fn: callback });

    await after.mock.calls[0][0]();
    expect(callback).toHaveBeenCalledOnce();
  });

  it("propagates callback failures through the registered callback", async () => {
    const failure = new Error("deferred failure");
    defer({ fn: () => Promise.reject(failure) });

    await expect(after.mock.calls[0][0]()).rejects.toBe(failure);
  });
});