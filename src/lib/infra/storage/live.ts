import { createClient } from "@supabase/supabase-js";
import type { StorageLayer, StorageListOptions, StorageMetadata, StorageListResult, StorageUploadOptions } from "./common";

export default function liveStorageFactory(): StorageLayer {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "assets";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase storage requires SUPABASE_URL and a server-side or publishable key.");
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  function mapMetadata(pathname: string, publicUrl: string, size = 0, contentType = "application/octet-stream", uploadedAt = new Date()): StorageMetadata {
    return {
      url: publicUrl,
      downloadUrl: publicUrl,
      pathname,
      size,
      uploadedAt,
      contentType,
      contentDisposition: `attachment; filename="${pathname}"`,
      cacheControl: "max-age=0",
      etag: "supabase-etag",
    };
  }

  return {
    async upload(key: string, fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream, options?: StorageUploadOptions): Promise<StorageMetadata> {
      const contentType = options?.contentType ?? "application/octet-stream";
      const cacheControl = options?.cacheControl ?? "3600";
      const body = typeof fileOrBody === "string" ? fileOrBody : fileOrBody;

      const { data, error } = await client.storage.from(bucket).upload(key, body as never, {
        contentType,
        cacheControl,
        upsert: true,
      });

      if (error) {
        throw new Error(error.message);
      }

      const publicUrl = client.storage.from(bucket).getPublicUrl(key).data.publicUrl;
      return mapMetadata(key, publicUrl, 0, contentType);
    },

    async get(key: string): Promise<StorageMetadata | null> {
      const publicUrl = client.storage.from(bucket).getPublicUrl(key).data.publicUrl;
      const { data, error } = await client.storage.from(bucket).list(key.split("/").slice(0, -1).join("/") || "");
      if (error || !data) {
        return null;
      }

      const match = data.find((entry) => entry.name === key.split("/").pop());
      if (!match) {
        return null;
      }

      const size = match.metadata?.size ?? 0;
      const contentType = match.metadata?.mimetype ?? "application/octet-stream";
      const uploadedAt = match.updated_at ? new Date(match.updated_at) : new Date();

      return mapMetadata(key, publicUrl, size, contentType, uploadedAt);
    },

    async delete(key: string): Promise<void> {
      const { error } = await client.storage.from(bucket).remove([key]);
      if (error) {
        throw new Error(error.message);
      }
    },

    async list(options?: StorageListOptions): Promise<StorageListResult> {
      const prefix = options?.prefix ?? "";
      const { data, error } = await client.storage.from(bucket).list(prefix);
      if (error) {
        throw new Error(error.message);
      }

      const blobs: StorageMetadata[] = (data ?? []).map((entry) => {
        const pathname = prefix ? `${prefix}/${entry.name}`.replace(/\/+/g, "/") : entry.name;
        const publicUrl = client.storage.from(bucket).getPublicUrl(pathname).data.publicUrl;
        const size = entry.metadata?.size ?? 0;
        const contentType = entry.metadata?.mimetype ?? "application/octet-stream";
        const uploadedAt = entry.updated_at ? new Date(entry.updated_at) : new Date();

        return mapMetadata(pathname, publicUrl, size, contentType, uploadedAt);
      });

      return {
        blobs,
        hasMore: false,
      };
    },
  };
}