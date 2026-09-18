import { injectable, inject } from "inversify";
import { ValidationError } from "@/lib/api/domain-errors";
import { FoodRepository } from "@/repositories/food-repository";
import { uploadImages, assertImagesMatchFiles, cleanupUploadedImages, collectEntityStorageKeys, deleteStorageKeys } from "./image-upload-service";
import { Food, Image } from "@/entities";

@injectable()
export class FoodService {
  constructor(@inject("FoodRepository") private repo: FoodRepository) {}

  async listFoodsService() {
    return this.repo.listFoods();
  }

  async getFoodDetailService(id: string) {
    if (!id) throw new ValidationError({ code: "food-id-required", detail: "A food id is required." });
    return this.repo.findFoodDetailById(id);
  }

  async createFoodService(input: {
    foodFields: FoodUncheckedCreateInput;
    imagesMeta?: Array<Partial<Image>>;
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
      return await this.repo.createFoodWithImages({ id: foodId, fields: input.foodFields, images: uploaded as Partial<Image>[] });
    } catch (err) {
      await cleanupUploadedImages({ folder: "foods", parentId: foodId, imageIds: uploaded.map((u) => u.id) });
      throw err;
    }
  }

  async createSimpleFoodService(input: Omit<FoodUncheckedCreateInput, "id">) {
    if (!input.name) {
      throw new ValidationError({ code: "food-name-required", detail: "A food name is required." });
    }
    return this.repo.createSimpleFood(input as Partial<Food>);
  }

  async deleteFoodService(id: string) {
    if (!id) throw new ValidationError({ code: "food-id-required", detail: "A food id is required." });
    const imageIds = await this.repo.findFoodImageIds(id);
    const keys = await collectEntityStorageKeys({ folder: "foods", parentId: id, knownIds: imageIds });
    await deleteStorageKeys(keys);
    return this.repo.deleteFoodById(id);
  }
}
export type FoodUncheckedCreateInput = Partial<Omit<Food, "id" | "createdAt" | "updatedAt" | "images">>;
