import { createClient } from "@supabase/supabase-js";
import type {
  StorageProvider,
  StorageListOptions,
  StorageMetadata,
  StorageListResult,
  StorageUploadOptions,
  StorageUpload,
} from "./common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function supabaseStorage(): StorageProvider {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "assets";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase storage requires SUPABASE_URL and a server-side or publishable key.",
    );
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  function mapMetadata(
    pathname: string,
    publicUrl: string,
    size = 0,
    contentType = "application/octet-stream",
    uploadedAt = new Date(),
  ): StorageMetadata {
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
    async upload(
      key: string,
      fileOrBody: string | File | Blob | ArrayBuffer | ReadableStream,
      options?: StorageUploadOptions,
    ): Promise<StorageMetadata> {
      const contentType = options?.contentType ?? "application/octet-stream";
      const cacheControl = options?.cacheControl ?? "3600";
      const body = typeof fileOrBody === "string" ? fileOrBody : fileOrBody;

      const { error } = await client.storage
        .from(bucket)
        .upload(key, body as never, {
          contentType,
          cacheControl,
          upsert: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      const publicUrl = client.storage.from(bucket).getPublicUrl(key)
        .data.publicUrl;
      return mapMetadata(key, publicUrl, 0, contentType);
    },

    async createUpload(
      key: string,
      options?: StorageUploadOptions,
    ): Promise<StorageUpload> {
      const region = process.env.SUPABASE_S3_REGION;
      const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID;
      const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;

      if (!region || !accessKeyId || !secretAccessKey) {
        throw new Error(
          "Supabase S3 storage requires region and S3 credentials.",
        );
      }

      const s3 = new S3Client({
        forcePathStyle: true,
        region,
        endpoint: `${supabaseUrl}/storage/v1/s3`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: options?.contentType,
        CacheControl: options?.cacheControl,
      });

      const uploadUrl = await getSignedUrl(s3, command, {
        expiresIn: 60 * 60,
      });

      return {
        uploadUrl,
        pathname: key,
      };
    },

    async get(key: string): Promise<StorageMetadata | null> {
      const publicUrl = client.storage.from(bucket).getPublicUrl(key)
        .data.publicUrl;
      const { data, error } = await client.storage
        .from(bucket)
        .list(key.split("/").slice(0, -1).join("/") || "");
      if (error || !data) {
        return null;
      }

      const match = data.find((entry) => entry.name === key.split("/").pop());
      if (!match) {
        return null;
      }

      const size = match.metadata?.size ?? 0;
      const contentType =
        match.metadata?.mimetype ?? "application/octet-stream";
      const uploadedAt = match.updated_at
        ? new Date(match.updated_at)
        : new Date();

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
        const pathname = prefix
          ? `${prefix}/${entry.name}`.replace(/\/+/g, "/")
          : entry.name;
        const publicUrl = client.storage.from(bucket).getPublicUrl(pathname)
          .data.publicUrl;
        const size = entry.metadata?.size ?? 0;
        const contentType =
          entry.metadata?.mimetype ?? "application/octet-stream";
        const uploadedAt = entry.updated_at
          ? new Date(entry.updated_at)
          : new Date();

        return mapMetadata(pathname, publicUrl, size, contentType, uploadedAt);
      });

      return {
        blobs,
        hasMore: false,
      };
    },
  };
}
