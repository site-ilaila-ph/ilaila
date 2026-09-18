import { join } from "node:path/posix";
import { randomUUID } from "node:crypto";
import { type StorageManager } from "@/lib/infra";
import { acquireStorageManager } from "@/lib/storage";
import { ValidationError } from "@/lib/api/domain-errors";

export interface ImageBlobInput {
  blob: Blob;
  meta?: Partial<BusinessImage>;
}

export async function uploadImages(input: {
  folder: string;
  parentId: string;
  files: ImageBlobInput[];
  storage?: StorageManager;
}): Promise<Array<Partial<BusinessImage> & { id: string; url: string }>> {
  const storage = input.storage ?? acquireStorageManager();
  return Promise.all(
    input.files.map(async (file, i) => {
      const imageId = randomUUID();
      const { url } = await storage.upload({
        key: join(input.folder, input.parentId, "images", imageId),
        fileOrBody: file.blob,
        options: { contentType: file.blob.type },
      });
      void i;
      return { ...(file.meta ?? {}), id: imageId, url };
    }),
  );
}

export function assertImagesMatchFiles(metas: Partial<BusinessImage>[], files: Blob[], context: string): void {
  if (metas.length > 0 && metas.length !== files.length) {
    throw new ValidationError({
      code: "images-files-mismatch",
      detail: `metadata.images has ${metas.length} entries but ${files.length} image files were uploaded in ${context}.`,
    });
  }
}

export async function cleanupUploadedImages(input: {
  folder: string;
  parentId: string;
  imageIds: string[];
  storage?: StorageManager;
}): Promise<void> {
  if (input.imageIds.length === 0) return;
  const storage = input.storage ?? acquireStorageManager();
  await Promise.allSettled(
    input.imageIds.map((imageId) => storage.delete({ key: join(input.folder, input.parentId, "images", imageId) })),
  );
}

export async function collectEntityStorageKeys(input: {
  folder: string;
  parentId: string;
  knownIds: string[];
  storage?: StorageManager;
}): Promise<string[]> {
  const storage = input.storage ?? acquireStorageManager();
  const keys = new Set<string>();
  input.knownIds.forEach((id) => keys.add(join(input.folder, input.parentId, "images", id)));
  for (const folder of [join(input.folder, input.parentId), join(input.folder, input.parentId, "images")]) {
    const { blobs } = await storage.list({ prefix: folder });
    blobs.forEach((blob: { pathname: string }) => keys.add(blob.pathname));
  }
  return [...keys];
}

export async function deleteStorageKeys(keys: string[], storage?: StorageManager): Promise<void> {
  const manager = storage ?? acquireStorageManager();
  const removals = await Promise.allSettled(keys.map((key) => manager.delete({ key })));
  removals.forEach((result) => {
    if (result.status === "rejected") {
      console.error("storage cleanup: failed to remove object", result.reason);
    }
  });
}
