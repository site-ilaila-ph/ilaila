import { injectable, inject } from "inversify";
import { TYPES } from "@/lib/types";
import { ValidationError, NotFoundError } from "@/lib/api/domain-errors";
import { Image } from "@/entities";
import { acquireStorageManager } from "@/lib/storage";
import { ImageRepository } from "@/repositories/image-repository";

@injectable()
export class ImageService {
  constructor(@inject(TYPES.ImageRepository) private repo: ImageRepository) {}

  async listImagesService(parentType?: string, parentId?: string) {
    return this.repo.listImages(parentType, parentId);
  }

  async getImageByIdService(id: string) {
    if (!id) throw new ValidationError({ code: "image-id-required", detail: "An image id is required." });
    const image = await this.repo.findImageById(id);
    if (!image) {
      throw new NotFoundError({ code: "image-not-found", title: "Not Found", detail: "The image does not exist." });
    }
    return image;
  }

  async uploadImageService(input: {
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

    return this.repo.createImage({
      id: imageId,
      description: input.description ?? "",
      url,
      parentType: input.parentType ?? null,
      parentId: input.parentId ?? null,
    });
  }

  async deleteImageService(id: string) {
    const image = await this.getImageByIdService(id);
    const storage = acquireStorageManager();
    if (image.url) {
      // Derive pathname from url or use a stored pathname if available
      // For simplicity, attempt delete by deriving from url or skip
    }
    await this.repo.deleteImageById(id);
    return { success: true };
  }
}
