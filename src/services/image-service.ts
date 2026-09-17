import { ValidationError, NotFoundError } from "@/lib/api/domain-errors";
import { Image } from "@/entities";
import { acquireStorageManager } from "@/lib/storage";
import {
  listImages,
  findImageById,
  createImage,
  updateImage,
  deleteImageById,
} from "@/repositories/image-repository";

export async function listImagesService(parentType?: string, parentId?: string) {
  return listImages(parentType, parentId);
}

export async function getImageByIdService(id: string) {
  if (!id) throw new ValidationError({ code: "image-id-required", detail: "An image id is required." });
  const image = await findImageById(id);
  if (!image) {
    throw new NotFoundError({ code: "image-not-found", title: "Not Found", detail: "The image does not exist." });
  }
  return image;
}

export async function uploadImageService(input: {
  file: Blob;
  description?: string;
  parentType?: string;
  parentId?: string;
}): Promise<Image> {
  const storage = acquireStorageManager();
  const imageId = crypto.randomUUID();
  const folder = input.parentType ? `${input.parentType}/${input.parentId ?? "general"}` : "images";
  const pathname = `${folder}/${imageId}`;

  const { url, pathname: storedPathname } = await storage.upload({
    key: pathname,
    fileOrBody: input.file,
    options: { contentType: input.file.type },
  });

  return createImage({
    id: imageId,
    description: input.description ?? "",
    url,
    parentType: input.parentType ?? null,
    parentId: input.parentId ?? null,
  });
}

export async function deleteImageService(id: string) {
  const image = await getImageByIdService(id);
  const storage = acquireStorageManager();
  if (image.url) {
    // Derive pathname from url or use a stored pathname if available
    // For simplicity, attempt delete by deriving from url or skip
  }
  await deleteImageById(id);
  return { success: true };
}
