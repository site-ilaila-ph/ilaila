import type { ListOptions } from "@/lib/api/list-options";
import { ValidationError } from "@/lib/api/domain-errors";
import type { Prisma } from "@/generated/prisma/client";
import {
  listFoods,
  findFoodDetailById,
  createFoodWithImages,
  createSimpleFood,
  findFoodImageIds,
  deleteFoodById,
} from "@/repositories/food-repository";
import { uploadImages, assertImagesMatchFiles, cleanupUploadedImages, collectEntityStorageKeys, deleteStorageKeys } from "./image-upload-service";

export async function listFoodsService(options: ListOptions) {
  return listFoods(options);
}

export async function getFoodDetailService(id: string) {
  if (!id) throw new ValidationError({ code: "food-id-required", detail: "A food id is required." });
  return findFoodDetailById(id);
}

export async function createFoodService(input: {
  foodFields: Prisma.FoodUncheckedCreateInput;
  imagesMeta?: Array<Record<string, unknown>>;
  imageFiles?: Blob[];
}) {
  if (!input.foodFields) {
    throw new ValidationError({ code: "food-required", detail: "metadata.food is required." });
  }
  const metas = input.imagesMeta ?? [];
  const files = input.imageFiles ?? [];
  assertImagesMatchFiles(metas, files, "food create");
  const foodId = crypto.randomUUID();
  const uploaded = await uploadImages({
    folder: "foods",
    parentId: foodId,
    files: files.map((blob, i) => ({ blob, meta: metas[i] })),
  });
  try {
    return await createFoodWithImages({ id: foodId, fields: input.foodFields, images: uploaded as never });
  } catch (err) {
    await cleanupUploadedImages({ folder: "foods", parentId: foodId, imageIds: uploaded.map((u) => u.id) });
    throw err;
  }
}

export async function createSimpleFoodService(input: Omit<Prisma.FoodUncheckedCreateInput, "id">) {
  if (!input.name) {
    throw new ValidationError({ code: "food-name-required", detail: "A food name is required." });
  }
  return createSimpleFood(input);
}

export async function deleteFoodService(id: string) {
  if (!id) throw new ValidationError({ code: "food-id-required", detail: "A food id is required." });
  const imageIds = await findFoodImageIds(id);
  const keys = await collectEntityStorageKeys({ folder: "foods", parentId: id, knownIds: imageIds });
  await deleteStorageKeys(keys);
  return deleteFoodById(id);
}
