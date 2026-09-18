import { injectable } from "inversify";
import { DataSource } from "typeorm";
import { Food, Image } from "@/entities";
import type { SortableFields, FilterableFields, IncludeList } from "@/lib/api/list-options";

export const sortableFields: SortableFields = ["name","isHeritage","culturalSignificance","createdAt"];
export const filterableFields: FilterableFields = { name: "string", isHeritage: "boolean", culturalSignificance: "string", description: "string", history: "string", preparation: "string", recipe: "string" };
export const includeableRelations: IncludeList = ["images","tags","businesses"];

export interface FoodPatchImageInput {
  id: string;
  description?: string;
  url?: string;
  new?: boolean;
  remove?: boolean;
}

@injectable()
export class FoodRepository {
  public constructor(private readonly db: DataSource) {}

  private get repo() {
    return this.db.getRepository(Food);
  }

  async listFoods() {
    return this.repo.find({ relations: { images: true, businesses: true } });
  }

  async findFoodDetailById(id: string) {
    return this.repo.findOne({ where: { id }, relations: { images: true, tags: true, businesses: { business: true } } });
  }

  async createFoodWithImages(input: { id: string; fields: Partial<Food>; images: Array<Partial<Image>> }) {
    const repo = this.repo;
    const food = repo.create({ ...input.fields, id: input.id });
    const saved = await repo.save(food);
    return saved;
  }

  async createSimpleFood(input: Partial<Food>) {
    return this.repo.save({ ...input, id: crypto.randomUUID() });
  }

  async findFoodImageIds(id: string): Promise<string[]> {
    const food = await this.repo.findOne({ where: { id }, relations: { images: true } });
    return food?.images?.map((img: { id: string }) => img.id) ?? [];
  }

  async deleteFoodById(id: string) {
    await this.repo.delete({ id });
    return { success: true };
  }

  async patchFoodWithImages(input: { id: string; foodFields: Partial<Food>; images?: FoodPatchImageInput[] }) {
    await this.repo.update({ id: input.id }, input.foodFields);
    return this.repo.findOne({ where: { id: input.id }, relations: { images: true } });
  }
}
