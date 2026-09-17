import { acquireDatabase } from "@/lib/database";
import { Food } from "@/entities";
import type { SortableFields, FilterableFields, IncludeList } from "@/lib/api/list-options";

export const sortableFields: SortableFields = ["name","isHeritage","culturalSignificance","createdAt"];
export const filterableFields: FilterableFields = { name: "string", isHeritage: "boolean", culturalSignificance: "string", description: "string", history: "string", preparation: "string", recipe: "string" };
export const includeableRelations: IncludeList = ["images","tags","businesses"];

export async function listFoods() {
  const db = await acquireDatabase();
  return db.getRepository(Food).find({ relations: { images: true, businesses: true } });
}
