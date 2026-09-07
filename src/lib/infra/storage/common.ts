import { put, type PutBlobResult, type HeadBlobResult, list, type ListBlobResult } from "@vercel/blob";
import { joinKey } from "../utils";

export type StorageKey = string | string[];

export interface StorageLayer {
  upload(
    key: string,
    fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream,
    options?: Parameters<typeof put>[2]
  ): Promise<PutBlobResult>;
  get(key: string): Promise<HeadBlobResult | null>;
  delete(key: string): Promise<void>;
  list(options?: Parameters<typeof list>[0]): Promise<ListBlobResult>;
}

// --- Manager ---------------------------------------------------------------

export interface StorageManager {
  upload(params: {
    key: StorageKey;
    fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream;
    options?: Parameters<typeof put>[2];
  }): Promise<PutBlobResult>;
  get(params: { key: StorageKey }): Promise<HeadBlobResult | null>;
  delete(params: { key: StorageKey }): Promise<void>;
  list(options?: Parameters<typeof list>[0]): Promise<ListBlobResult>;
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