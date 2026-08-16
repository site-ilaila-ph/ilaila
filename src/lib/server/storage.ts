import { put, del, head, list, type PutBlobResult, type ListBlobResult, type HeadBlobResult } from "@vercel/blob";

export type StorageKey = string | string[];

export interface StorageLayer {
  upload(key: string, fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream, options?: Parameters<typeof put>[2]): Promise<PutBlobResult>;
  get(key: string): Promise<HeadBlobResult | null>;
  delete(key: string): Promise<void>;
  list(options?: Parameters<typeof list>[0]): Promise<ListBlobResult>;
}

// #region Helpers
function formatKey({ key }: { key: StorageKey }): string {
  if (Array.isArray(key)) {
    return key.map(encodeURIComponent).join("/");
  }
  return key;
}
// #endregion

// #region In-Memory / Local Fallback Storage (for development / testing without live Vercel Blob credentials)
interface MemoryStorageEntry {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  contentType?: string;
  body: Uint8Array;
}

interface MemoryStorageInstance {
  store: Map<string, MemoryStorageEntry>;
}

function memoryStorageReadEntry({
  self,
  key,
}: {
  self: MemoryStorageInstance;
  key: string;
}): MemoryStorageEntry | null {
  return self.store.get(key) ?? null;
}

async function memoryStorageUpload({
  self,
  key,
  fileOrBody,
  options,
}: {
  self: MemoryStorageInstance;
  key: string;
  fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream;
  options?: Parameters<typeof put>[2];
}): Promise<PutBlobResult> {
  let bytes: Uint8Array;
  if (typeof fileOrBody === "string") {
    bytes = new TextEncoder().encode(fileOrBody);
  } else if (fileOrBody instanceof ArrayBuffer) {
    bytes = new Uint8Array(fileOrBody);
  } else if (fileOrBody instanceof Blob) {
    bytes = new Uint8Array(await fileOrBody.arrayBuffer());
  } else {
    // For File or other stream-like or unsupported in simple in-memory mock, fallback or read
    if (fileOrBody instanceof File) {
      bytes = new Uint8Array(await fileOrBody.arrayBuffer());
    } else {
      bytes = new Uint8Array(0);
    }
  }

  const entry: MemoryStorageEntry = {
    url: `https://memory-storage.local/${key}`,
    pathname: key,
    size: bytes.length,
    uploadedAt: new Date(),
    contentType: options?.contentType,
    body: bytes,
  };

  self.store.set(key, entry);

  return {
    url: entry.url,
    downloadUrl: entry.url,
    pathname: entry.pathname,
    contentType: entry.contentType ?? "application/octet-stream",
    contentDisposition: `attachment; filename="${key}"`,
    etag: "memory-etag",
  };
}

async function memoryStorageGet({
  self,
  key,
}: {
  self: MemoryStorageInstance;
  key: string;
}): Promise<HeadBlobResult | null> {
  const item = memoryStorageReadEntry({ self, key });
  if (!item) return null;

  return {
    url: item.url,
    downloadUrl: item.url,
    pathname: item.pathname,
    size: item.size,
    uploadedAt: item.uploadedAt,
    contentType: item.contentType ?? "application/octet-stream",
    contentDisposition: `attachment; filename="${key}"`,
    cacheControl: "max-age=0",
    etag: "memory-etag",
  };
}

async function memoryStorageDelete({
  self,
  key,
}: {
  self: MemoryStorageInstance;
  key: string;
}): Promise<void> {
  self.store.delete(key);
}

async function memoryStorageList({
  self,
  options,
}: {
  self: MemoryStorageInstance;
  options?: Parameters<typeof list>[0];
}): Promise<ListBlobResult> {
  const prefix = options?.prefix;
  const entries = Array.from(self.store.values()).filter((item) => {
    if (!prefix) return true;
    return item.pathname.startsWith(prefix);
  });

  return {
    blobs: entries.map((item) => ({
      url: item.url,
      downloadUrl: item.url,
      pathname: item.pathname,
      size: item.size,
      uploadedAt: item.uploadedAt,
      etag: "memory-etag",
    })),
    hasMore: false,
  };
}

function createMemoryStorage(): StorageLayer {
  const self: MemoryStorageInstance = { store: new Map() };

  return {
    upload: (key, fileOrBody, options) => memoryStorageUpload({ self, key, fileOrBody, options }),
    get: (key) => memoryStorageGet({ self, key }),
    delete: (key) => memoryStorageDelete({ self, key }),
    list: (options) => memoryStorageList({ self, options }),
  };
}
// #endregion

// #region Vercel Blob Storage
async function vercelBlobUpload({
  key,
  fileOrBody,
  options,
}: {
  key: string;
  fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream;
  options?: Parameters<typeof put>[2];
}): Promise<PutBlobResult> {
  return await put(key, fileOrBody, {
    access: "public",
    ...options,
  });
}

async function vercelBlobGet({
  key,
}: {
  key: string;
}): Promise<HeadBlobResult | null> {
  try {
    const result = await head(key);
    return result;
  } catch {
    return null;
  }
}

async function vercelBlobDelete({
  key,
}: {
  key: string;
}): Promise<void> {
  await del(key);
}

async function vercelBlobList({
  options,
}: {
  options?: Parameters<typeof list>[0];
}): Promise<ListBlobResult> {
  return await list(options);
}

function createVercelBlobStorage(): StorageLayer {
  return {
    upload: (key, fileOrBody, options) => vercelBlobUpload({ key, fileOrBody, options }),
    get: (key) => vercelBlobGet({ key }),
    delete: (key) => vercelBlobDelete({ key }),
    list: (options) => vercelBlobList({ options }),
  };
}
// #endregion

// #region Manager
interface StorageManagerInstance {
  layer: StorageLayer;
}

async function storageManagerUpload({
  self,
  key,
  fileOrBody,
  options,
}: {
  self: StorageManagerInstance;
  key: StorageKey;
  fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream;
  options?: Parameters<typeof put>[2];
}): Promise<PutBlobResult> {
  const k = formatKey({ key });
  return await self.layer.upload(k, fileOrBody, options);
}

async function storageManagerGet({
  self,
  key,
}: {
  self: StorageManagerInstance;
  key: StorageKey;
}): Promise<HeadBlobResult | null> {
  const k = formatKey({ key });
  return await self.layer.get(k);
}

async function storageManagerDelete({
  self,
  key,
}: {
  self: StorageManagerInstance;
  key: StorageKey;
}): Promise<void> {
  const k = formatKey({ key });
  await self.layer.delete(k);
}

async function storageManagerList({
  self,
  options,
}: {
  self: StorageManagerInstance;
  options?: Parameters<typeof list>[0];
}): Promise<ListBlobResult> {
  return await self.layer.list(options);
}

export interface StorageManager {
  upload(params: { key: StorageKey; fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream; options?: Parameters<typeof put>[2] }): Promise<PutBlobResult>;
  get(params: { key: StorageKey }): Promise<HeadBlobResult | null>;
  delete(params: { key: StorageKey }): Promise<void>;
  list(params?: Parameters<typeof list>[0]): Promise<ListBlobResult>;
}

// #endregion

// #region Exports
export function acquireStorageManager(): StorageManager {
  const useMemory = process.env.NODE_ENV !== "production" && !process.env.BLOB_READ_WRITE_TOKEN;
  const self: StorageManagerInstance = {
    layer: useMemory ? createMemoryStorage() : createVercelBlobStorage(),
  };

  return {
    upload: ({ key, fileOrBody, options }) => storageManagerUpload({ self, key, fileOrBody, options }),
    get: ({ key }) => storageManagerGet({ self, key }),
    delete: ({ key }) => storageManagerDelete({ self, key }),
    list: (options) => storageManagerList({ self, options }),
  };
}

// #endregion
