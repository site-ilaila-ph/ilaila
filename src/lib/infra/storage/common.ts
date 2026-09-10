import { joinKey } from "../utils";

export type StorageKey = string | string[];

export interface StorageMetadata {
  url: string;
  downloadUrl: string;
  pathname: string;
  size?: number;
  uploadedAt?: Date;
  contentType?: string;
  contentDisposition?: string;
  cacheControl?: string;
  etag?: string;
}

export interface StorageListResult {
  blobs: Array<StorageMetadata>;
  hasMore: boolean;
}

export interface StorageUploadOptions {
  contentType?: string;
  cacheControl?: string;
  [key: string]: unknown;
}

export interface StorageListOptions {
  prefix?: string;
  [key: string]: unknown;
}

export interface StorageLayer {
  upload(
    key: string,
    fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream,
    options?: StorageUploadOptions
  ): Promise<StorageMetadata>;
  get(key: string): Promise<StorageMetadata | null>;
  delete(key: string): Promise<void>;
  list(options?: StorageListOptions): Promise<StorageListResult>;
}

// --- Manager ---------------------------------------------------------------

export interface StorageManager {
  upload(params: {
    key: StorageKey;
    fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream;
    options?: StorageUploadOptions;
  }): Promise<StorageMetadata>;
  get(params: { key: StorageKey }): Promise<StorageMetadata | null>;
  delete(params: { key: StorageKey }): Promise<void>;
  list(options?: StorageListOptions): Promise<StorageListResult>;
}

export function createStorageManager({ layer }: { layer: StorageLayer }): StorageManager {
  const formatKey = (key: StorageKey) => joinKey(key, "/");

  return {
    upload: ({ key, fileOrBody, options }) => layer.upload(formatKey(key), fileOrBody, options),
    get: ({ key }) => layer.get(formatKey(key)),
    delete: ({ key }) => layer.delete(formatKey(key)),
    list: (options) => layer.list(options),
  };
}