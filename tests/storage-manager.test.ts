import { describe, expect, it } from "vitest";
import { acquireStorageManager } from "@/lib/infra";

describe("StorageManager", () => {
  it("uploads text and reports metadata", async () => {
    const storage = acquireStorageManager();
    const content = "Hello, storage";
    const result = await storage.upload({
      key: ["test folder", "hello.txt"],
      fileOrBody: content,
      options: { access: "public", contentType: "text/plain" },
    });

    expect(result.pathname).toBe("test%20folder/hello.txt");
    expect(result.contentType).toBe("text/plain");
    expect((await storage.get({ key: ["test folder", "hello.txt"] }))?.size).toBe(Buffer.byteLength(content));
  });

  it("persists objects across manager instances", async () => {
    const key = ["persistence", "shared.txt"];
    const firstStorage = acquireStorageManager();
    await firstStorage.upload({ key, fileOrBody: "shared content" });

    const secondStorage = acquireStorageManager();
    expect((await secondStorage.get({ key }))?.size).toBe(Buffer.byteLength("shared content"));

    await secondStorage.delete({ key });
  });

  it("lists only matching keys and supports binary bodies", async () => {
    const storage = acquireStorageManager();
    await storage.upload({ key: ["folder", "one.bin"], fileOrBody: new Uint8Array([1, 2, 3]).buffer });
    await storage.upload({ key: ["other", "two.txt"], fileOrBody: "two" });

    const result = await storage.list({ prefix: "folder" });
    expect(result.blobs).toHaveLength(1);
    expect(result.blobs[0].pathname).toBe("folder/one.bin");
    expect(result.hasMore).toBe(false);
  });

  it("returns null for missing objects and tolerates deleting them", async () => {
    const storage = acquireStorageManager();

    expect(await storage.get({ key: "missing" })).toBeNull();
    await expect(storage.delete({ key: "missing" })).resolves.toBeUndefined();
    expect((await storage.list({ prefix: "missing" })).blobs).toEqual([]);
  });

  it("removes uploaded objects", async () => {
    const storage = acquireStorageManager();
    const key = ["folder", "remove.txt"];
    await storage.upload({ key, fileOrBody: "remove me" });

    await storage.delete({ key });
    expect(await storage.get({ key })).toBeNull();
  });
});