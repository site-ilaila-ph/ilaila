import { acquirePrismaClient } from "@/lib/infra";
import { Prisma } from "@/generated/prisma/client";

export type FoodPatchImageInput = {
  id: string;
  new?: boolean;
  remove?: boolean;
  position?: number;
  description?: string;
};

export async function patchFoodWithImages(input: {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  foodFields: Record<string, any>;
  images?: FoodPatchImageInput[];
  newFiles: Map<string, Blob>;
}) {
  const db = acquirePrismaClient();
  const { id, images, newFiles, foodFields } = input;
  const toUpdate = images?.filter((img) => !img.new && !img.remove) ?? [];
  const toCreate = images?.filter((img) => img.new) ?? [];
  const toRemove = images?.filter((img) => img.remove) ?? [];

  const referencedIds = [...toUpdate, ...toRemove].map((img) => img.id);
  if (referencedIds.length > 0) {
    const existingImages = await db.foodImage.findMany({
      where: { id: { in: referencedIds }, foodId: id },
      select: { id: true },
    });
    const foundIds = new Set(existingImages.map((img) => img.id));
    const missing = referencedIds.filter((imageId) => !foundIds.has(imageId));
    if (missing.length > 0) {
      const err = new Error(`Image(s) not found for this food: ${missing.join(", ")}`);
      (err as Error & { code?: string }).code = "image-not-found";
      throw err;
    }
  }

  for (const img of toCreate) {
    if (!(newFiles.get(`image:${img.id}`) instanceof Blob)) {
      const err = new Error(`A file is required for new image '${img.id}'.`);
      (err as Error & { code?: string }).code = "image-file-required";
      throw err;
    }
  }

  const { acquireStorageManager } = await import("@/lib/infra");
  const { randomUUID } = await import("node:crypto");
  const { join } = await import("node:path/posix");
  const storageManager = acquireStorageManager();
  const newlyCreatedImageIds: string[] = [];

  try {
    const imagesToCreate: Prisma.FoodImageCreateManyFoodInput[] = [];
    for (const img of toCreate) {
      const file = newFiles.get(`image:${img.id}`) as Blob;
      const newImageId = randomUUID();
      const { url } = await storageManager.upload({
        key: join("foods", id, "images", newImageId),
        fileOrBody: file,
        options: { contentType: file.type },
      });
      newlyCreatedImageIds.push(newImageId);
      imagesToCreate.push({
        id: newImageId,
        position: img.position ?? 0,
        description: img.description ?? "",
        url
      });
    }

    const imageUpdates = await Promise.all(
      toUpdate.map(async (img) => {
        const file = newFiles.get(`image:${img.id}`);
        const updatedFile =
          file instanceof Blob
            ? await storageManager.upload({
                key: join("foods", id, "images", img.id),
                fileOrBody: file,
                options: { contentType: file.type },
              })
            : null;
        const data: Prisma.FoodImageUpdateInput = {
          ...(img.description !== undefined ? { description: img.description } : {}),
          ...(img.position !== undefined ? { position: img.position } : {}),
        };
        if (updatedFile) data.url = updatedFile.url;
        return { where: { id: img.id }, data };
      }),
    );

    const data = await db.$transaction(async (tx) => {
      const updatedFood = await tx.food.update({
        where: { id },
        data: {
          ...foodFields,
          images:
            imageUpdates.length > 0 || imagesToCreate.length > 0 || toRemove.length > 0
              ? {
                  update: imageUpdates.length > 0 ? imageUpdates : undefined,
                  create: imagesToCreate.length > 0 ? imagesToCreate : undefined,
                  deleteMany: toRemove.length > 0 ? { id: { in: toRemove.map((img) => img.id) } } : undefined,
                }
              : undefined,
        },
        include: { images: true },
      });
      return updatedFood;
    });

    const removals = await Promise.allSettled(
      toRemove.map((img) => storageManager.delete({ key: join("foods", id, "images", img.id) })),
    );
    removals.forEach((result) => {
      if (result.status === "rejected") {
        console.error("patchFood: failed to remove image object", result.reason);
      }
    });

    return data;
  } catch (err) {
    if (newlyCreatedImageIds.length > 0) {
      await Promise.allSettled(
        newlyCreatedImageIds.map((imageId) => storageManager.delete({ key: join("foods", id, "images", imageId) })),
      );
    }
    throw err;
  }
}
