import { acquireDatabase } from "@/lib/database";
import { Food } from "@/entities";
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

export async function listFoods() {
  const db = await acquireDatabase();
  return db.getRepository(Food).find({ relations: { images: true, businesses: true } });
}

export async function findFoodDetailById(id: string) {
  const db = await acquireDatabase();
  return db.getRepository(Food).findOne({ where: { id }, relations: { images: true, tags: true, businesses: { business: true } } });
}

export async function createFoodWithImages(input: { id: string; fields: Partial<Food>; images: Array<Partial<FoodImage>> }) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Food);
  const food = repo.create({ ...input.fields, id: input.id });
  const saved = await repo.save(food);
  return saved;
}

export async function createSimpleFood(input: Partial<Food>) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Food);
  return repo.save({ ...input, id: crypto.randomUUID() });
}

export async function findFoodImageIds(id: string): Promise<string[]> {
  const db = await acquireDatabase();
  const food = await db.getRepository(Food).findOne({ where: { id }, relations: { images: true } });
  return food?.images?.map((img: { id: string }) => img.id) ?? [];
}

export async function deleteFoodById(id: string) {
  const db = await acquireDatabase();
  await db.getRepository(Food).delete({ id });
  return { success: true };
}

export async function patchFoodWithImages(input: { id: string; foodFields: Partial<Food>; images?: FoodPatchImageInput[] }) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Food);
  await repo.update({ id: input.id }, input.foodFields);
  return repo.findOne({ where: { id: input.id }, relations: { images: true } });
}
