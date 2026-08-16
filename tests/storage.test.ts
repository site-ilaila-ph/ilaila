import { describe, it, expect } from "vitest";
import { acquireStorageManager } from "@/lib/server/storage";

describe("Storage Abstraction Layer", () => {
  it("should upload, retrieve head, list, and delete files using memory storage fallback", async () => {
    const storage = acquireStorageManager();
    const testKey = ["test-folder", "hello.txt"];
    const testContent = "Hello, Vercel Blob Abstraction!";

    // 1. Upload
    const putResult = await storage.upload({
      key: testKey,
      fileOrBody: testContent,
      options: { access: "public", contentType: "text/plain" },
    });

    expect(putResult).toBeDefined();
    expect(putResult.url).toBeDefined();
    expect(putResult.pathname).toContain("test-folder/hello.txt");

    // 2. Get Head
    const headResult = await storage.get({ key: testKey });
    expect(headResult).not.toBeNull();
    expect(headResult?.contentType).toBe("text/plain");
    expect(headResult?.size).toBe(Buffer.byteLength(testContent));

    // 3. List
    const listResult = await storage.list({ prefix: "test-folder" });
    expect(listResult.blobs.length).toBeGreaterThan(0);
    expect(listResult.blobs.some((b: { pathname: string }) => b.pathname.includes("hello.txt"))).toBe(true);

    // 4. Delete
    await storage.delete({ key: testKey });
    const deletedHead = await storage.get({ key: testKey });
    expect(deletedHead).toBeNull();
  });
});
