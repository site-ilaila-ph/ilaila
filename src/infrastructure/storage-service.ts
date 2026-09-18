import { injectable, inject } from "inversify";
import { TYPES } from "@/lib/types";
import { joinKey } from "@/lib/cache/utils";

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

@injectable()
export class StorageService implements StorageManager {
  constructor(
    @inject(TYPES.StorageProvider) private layers: StorageProvider[],
  ) {}

  private formatKey(key: StorageKey): string {
    return joinKey(key, "/");
  }

  private hashKey(key: string): number {
    let hash = 0;
    for (let index = 0; index < key.length; index++) {
      hash = (hash * 31 + key.charCodeAt(index)) | 0;
    }
    return Math.abs(hash);
  }

  private selectLayer(key: string): StorageProvider {
    const index = this.hashKey(key) % this.layers.length;
    return this.layers[index];
  }

  async upload({ key, fileOrBody, options }: { key: StorageKey; fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream; options?: StorageUploadOptions }): Promise<StorageMetadata> {
    const formattedKey = this.formatKey(key);
    const layer = this.selectLayer(formattedKey);
    return layer.upload(formattedKey, fileOrBody, options);
  }

  async createUpload({ key, options }: { key: StorageKey; options?: StorageUploadOptions }): Promise<StorageUpload> {
    const formattedKey = this.formatKey(key);
    const layer = this.selectLayer(formattedKey);
    return layer.createUpload(formattedKey, options);
  }

  async get({ key }: { key: StorageKey }): Promise<StorageMetadata | null> {
    const formattedKey = this.formatKey(key);
    const layer = this.selectLayer(formattedKey);
    return layer.get(formattedKey);
  }

  async delete({ key }: { key: StorageKey }): Promise<void> {
    const formattedKey = this.formatKey(key);
    const layer = this.selectLayer(formattedKey);
    return layer.delete(formattedKey);
  }

  async list(options?: StorageListOptions): Promise<StorageListResult> {
    const results = await Promise.all(this.layers.map((layer) => layer.list(options)));
    return {
      blobs: results.flatMap((result) => result.blobs),
      hasMore: results.some((result) => result.hasMore),
    };
  }
}
