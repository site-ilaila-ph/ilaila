import { beforeEach, describe, expect, it, vi } from "vitest";
import { acquireNextJSCookieMap } from "@/lib/live";

const { cookieStore, cookies } = vi.hoisted(() => {
  const store = { get: vi.fn(), has: vi.fn(), set: vi.fn(), delete: vi.fn() };
  return { cookieStore: store, cookies: vi.fn(async () => store) };
});

vi.mock("next/headers", () => ({ cookies }));

describe("CookieMap", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads existing values and presence", async () => {
    cookieStore.get.mockReturnValue({ value: "session-token" });
    cookieStore.has.mockReturnValue(true);
    const map = await acquireNextJSCookieMap();

    expect(map.get("SESSION_TOKEN")).toBe("session-token");
    expect(map.has("SESSION_TOKEN")).toBe(true);
  });

  it("returns safe absence values for missing cookies", async () => {
    cookieStore.get.mockReturnValue(undefined);
    cookieStore.has.mockReturnValue(false);
    const map = await acquireNextJSCookieMap();

    expect(map.get("missing")).toBeNull();
    expect(map.has("missing")).toBe(false);
  });

  it("forwards writes and deletes without changing options", async () => {
    const map = await acquireNextJSCookieMap();
    const options = { httpOnly: true, sameSite: "lax" as const };

    map.set("SESSION_TOKEN", "new-token", options);
    map.delete("SESSION_TOKEN");

    expect(cookieStore.set).toHaveBeenCalledWith("SESSION_TOKEN", "new-token", options);
    expect(cookieStore.delete).toHaveBeenCalledWith("SESSION_TOKEN");
  });

  it("propagates a failed Next.js cookie provider", async () => {
    cookies.mockRejectedValueOnce(new Error("request context unavailable"));

    await expect(acquireNextJSCookieMap()).rejects.toThrow("request context unavailable");
  });
});