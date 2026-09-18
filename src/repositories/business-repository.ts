import { injectable } from "inversify";
import { DataSource } from "typeorm";
import { Business, Image } from "@/entities";
import type { ListOptions, SortableFields, FilterableFields, IncludeList } from "@/lib/api/list-options";

export const sortableFields: SortableFields = ["name","createdAt","updatedAt","isPublished","address","latitude","longitude"];
export const filterableFields: FilterableFields = { name: "string", isPublished: "boolean", address: "string", latitude: "number", longitude: "number", createdAt: "date", updatedAt: "date" };
export const includeableRelations: IncludeList = ["images","tags","reviews","menuItems","foods"];

@injectable()
export class BusinessRepository {
  public constructor(private readonly db: DataSource) {}

  private get repo() {
    return this.db.getRepository(Business);
  }

  async listBusinesses(options: ListOptions, opts?: { includeUnpublished?: boolean }) {
    return this.repo.find({ where: opts?.includeUnpublished ? {} : { isPublished: true }, relations: { images: true, reviews: true, menuItems: true, foods: true } });
  }

  async findBusinessDetailById(id: string) {
    return this.repo.findOne({ where: { id }, relations: { images: true, reviews: true, foods: true } });
  }

  async findBusinessByIdOrName(idOrName: string) {
    return this.repo.findOne({ where: [{ id: idOrName }, { name: idOrName }] });
  }

  async createBusinessWithImages(input: { id: string; fields: Partial<Business>; ownerId: string; images: Partial<Image>[] }) {
    return this.repo.save({ ...input.fields, id: input.id, createdById: input.ownerId });
  }

  async createSimpleBusiness(input: { ownerId: string; [k: string]: unknown }) {
    const { ownerId, ...fields } = input;
    return this.repo.save({ ...fields, id: crypto.randomUUID(), createdById: ownerId, isPublished: true });
  }

  async updateSimpleBusiness(input: { id: string; [k: string]: unknown }) {
    const repo = this.repo;
    const { id, ...data } = input;
    await repo.update({ id }, data);
    return repo.findOne({ where: { id } });
  }

  async deleteBusinessById(id: string) {
    await this.repo.delete({ id });
    return { success: true };
  }

  async findBusinessImageIds(businessId: string): Promise<string[]> {
    const rows = await this.repo.find({ where: { id: businessId }, relations: { images: true } });
    return (rows as { images?: { id: string }[] }[]).flatMap((r) => (r as { images?: { id: string }[] }).images?.map((i: { id: string }) => i.id) || []);
  }

  async findBusinessImageIdsByIds(ids: string[], businessId: string): Promise<string[]> {
    return this.findBusinessImageIds(businessId);
  }
}
