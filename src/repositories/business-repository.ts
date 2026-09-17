import { acquireDatabase } from "@/lib/database";
import { Business } from "@/entities";
import type { ListOptions, SortableFields, FilterableFields, IncludeList } from "@/lib/api/list-options";

export const sortableFields: SortableFields = ["name","createdAt","updatedAt","isPublished","address","latitude","longitude"];
export const filterableFields: FilterableFields = { name: "string", isPublished: "boolean", address: "string", latitude: "number", longitude: "number", createdAt: "date", updatedAt: "date" };
export const includeableRelations: IncludeList = ["images","tags","reviews","menuItems","foods"];

export async function listBusinesses(options: ListOptions, opts?: { includeUnpublished?: boolean }) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Business);
  return repo.find({ where: opts?.includeUnpublished ? {} : { isPublished: true }, relations: { images: true, reviews: true, menuItems: true, foods: true } });
}
export async function findBusinessDetailById(id: string) {
  const db = await acquireDatabase();
  return db.getRepository(Business).findOne({ where: { id }, relations: { images: true, reviews: true, foods: true } });
}
export async function findBusinessByIdOrName(idOrName: string) {
  const db = await acquireDatabase();
  return db.getRepository(Business).findOne({ where: [{ id: idOrName }, { name: idOrName }] });
}
export async function createBusinessWithImages(input: { id: string; fields: Partial<Business>; ownerId: string; images: Partial<BusinessImage>[] }) {
  const db = await acquireDatabase();
  return db.getRepository(Business).save({ ...input.fields, id: input.id, createdById: input.ownerId });
}
export async function createSimpleBusiness(input: { ownerId: string; [k: string]: unknown }) {
  const db = await acquireDatabase();
  const { ownerId, ...fields } = input;
  return db.getRepository(Business).save({ ...fields, id: crypto.randomUUID(), createdById: ownerId, isPublished: true });
}
export async function updateSimpleBusiness(input: { id: string; [k: string]: unknown }) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Business);
  const { id, ...data } = input;
  await repo.update({ id }, data);
  return repo.findOne({ where: { id } });
}
export async function deleteBusinessById(id: string) {
  const db = await acquireDatabase();
  await db.getRepository(Business).delete({ id });
  return { success: true };
}
export async function findBusinessImageIds(businessId: string): Promise<string[]> {
  const db = await acquireDatabase();
  const rows = await db.getRepository(Business).find({ where: { id: businessId }, relations: { images: true } });
  return (rows as { images?: { id: string }[] }[]).flatMap((r) => (r as { images?: { id: string }[] }).images?.map((i: { id: string }) => i.id) || []);
}
export async function findBusinessImageIdsByIds(ids: string[], businessId: string): Promise<string[]> {
  return findBusinessImageIds(businessId);
}
