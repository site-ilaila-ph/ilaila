import path from "path";
import type { StorageLayer } from "./common";
import type { ListBlobResult } from "@vercel/blob";
import { mkdir, writeFile, stat, readFile, unlink, readdir } from "fs-extra";

export default function devStorageFactory(): StorageLayer {
  interface Metadata {
    pathname: string;
    uploadedAt: string;
    contentType?: string;
  }

  const root = path.resolve(process.env.LOCAL_STORAGE_DIR ?? path.join(process.cwd(), ".local", "storage"));
  const metadataSuffix = ".metadata.json";

  function getPaths(key: string) {
    const filePath = path.resolve(root, key);
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
      throw new Error("Storage key escapes the local storage directory");
    }
    return { filePath, metadataPath: `${filePath}${metadataSuffix}` };
  }

  function getUrl(key: string): string {
    return `https://filesystem-storage.local/${key}`;
  }

  async function toBytes(
    fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream
  ): Promise<Uint8Array> {
    if (typeof fileOrBody === "string") return new TextEncoder().encode(fileOrBody);
    if (fileOrBody instanceof ArrayBuffer) return new Uint8Array(fileOrBody);
    if (fileOrBody instanceof Blob) return new Uint8Array(await fileOrBody.arrayBuffer());
    const reader = fileOrBody.getReader();
    const chunks: Uint8Array[] = [];
    let totalSize = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalSize += value.byteLength;
    }
    const body = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return body;
  }

  return {
    async upload(key, fileOrBody, options) {
      const body = await toBytes(fileOrBody);
      const { filePath, metadataPath } = getPaths(key);
      const metadata: Metadata = {
        pathname: key,
        uploadedAt: new Date().toISOString(),
        contentType: options?.contentType,
      };
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, body);
      await writeFile(metadataPath, JSON.stringify(metadata));

      return {
        url: getUrl(key),
        downloadUrl: getUrl(key),
        pathname: metadata.pathname,
        contentType: metadata.contentType ?? "application/octet-stream",
        contentDisposition: `attachment; filename="${key}"`,
        etag: "filesystem-etag",
      };
    },

    async get(key) {
      const { filePath, metadataPath } = getPaths(key);
      try {
        const [fileStats, metadataContents] = await Promise.all([
          stat(filePath),
          readFile(metadataPath, "utf8"),
        ]);
        const metadata = JSON.parse(metadataContents) as Metadata;

        return {
          url: getUrl(key),
          downloadUrl: getUrl(key),
          pathname: metadata.pathname,
          size: fileStats.size,
          uploadedAt: new Date(metadata.uploadedAt),
          contentType: metadata.contentType ?? "application/octet-stream",
          contentDisposition: `attachment; filename="${key}"`,
          cacheControl: "max-age=0",
          etag: "filesystem-etag",
        };
      } catch {
        return null;
      }
    },

    async delete(key) {
      const { filePath, metadataPath } = getPaths(key);
      await Promise.allSettled([unlink(filePath), unlink(metadataPath)]);
    },

    async list(options) {
      const prefix = options?.prefix;
      const blobs: ListBlobResult["blobs"] = [];

      async function visit(directory: string): Promise<void> {
        let entries;
        try {
          entries = await readdir(directory, { withFileTypes: true });
        } catch {
          return;
        }

        for (const entry of entries) {
          const entryPath = path.join(directory, entry.name);
          if (entry.isDirectory()) {
            await visit(entryPath);
            continue;
          }
          if (!entry.name.endsWith(metadataSuffix)) continue;

          const metadata = JSON.parse(await readFile(entryPath, "utf8")) as Metadata;
          if (prefix && !metadata.pathname.startsWith(prefix)) continue;
          const fileStats = await stat(entryPath.slice(0, -metadataSuffix.length));
          const url = getUrl(metadata.pathname);
          blobs.push({
            url,
            downloadUrl: url,
            pathname: metadata.pathname,
            size: fileStats.size,
            uploadedAt: new Date(metadata.uploadedAt),
            etag: "filesystem-etag",
          });
        }
      }

      await visit(root);
      return { blobs, hasMore: false };
    },
  };
}