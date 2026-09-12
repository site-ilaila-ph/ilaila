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

export interface StorageUpload {
  uploadUrl: string;
  pathname: string;
}

export interface StorageListOptions {
  prefix?: string;
  [key: string]: unknown;
}

export interface StorageProvider {
  upload(
    key: string,
    fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream,
    options?: StorageUploadOptions,
  ): Promise<StorageMetadata>;
  createUpload(
    key: string,
    options?: StorageUploadOptions,
  ): Promise<StorageUpload>;
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
  createUpload(params: {
    key: StorageKey;
    options?: StorageUploadOptions;
  }): Promise<StorageUpload>;
  get(params: { key: StorageKey }): Promise<StorageMetadata | null>;
  delete(params: { key: StorageKey }): Promise<void>;
  list(options?: StorageListOptions): Promise<StorageListResult>;
}

export function createStorageManager(layers: StorageProvider[]): StorageManager {
    if (layers.length === 0) {
        throw new Error(
            "Storage manager requires at least one storage layer.",
        );
    }

    const formatKey = (key: StorageKey) => joinKey(key, "/");

    function hashKey(key: string): number {
        let hash = 0;

        for (let index = 0; index < key.length; index++) {
            hash = (hash * 31 + key.charCodeAt(index)) | 0;
        }

        return Math.abs(hash);
    }

    function selectLayer(key: string): StorageProvider {
        const index = hashKey(key) % layers.length;

        return layers[index];
    }

    return {
        upload: ({ key, fileOrBody, options }) => {
            const formattedKey = formatKey(key);
            const layer = selectLayer(formattedKey);

            return layer.upload(formattedKey, fileOrBody, options);
        },

        createUpload: ({ key, options }) => {
            const formattedKey = formatKey(key);
            const layer = selectLayer(formattedKey);

            return layer.createUpload(formattedKey, options);
        },

        get: ({ key }) => {
            const formattedKey = formatKey(key);
            const layer = selectLayer(formattedKey);

            return layer.get(formattedKey);
        },

        delete: ({ key }) => {
            const formattedKey = formatKey(key);
            const layer = selectLayer(formattedKey);

            return layer.delete(formattedKey);
        },

        list: async (options) => {
            const results = await Promise.all(
                layers.map((layer) => layer.list(options)),
            );

            return {
                blobs: results.flatMap((result) => result.blobs),
                hasMore: results.some((result) => result.hasMore),
            };
        },
    };
}