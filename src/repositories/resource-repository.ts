import { injectable } from "inversify";
import { DataSource } from "typeorm";
import { Resource } from "@/entities";

@injectable()
export class ResourceRepository {
  public constructor(private readonly db: DataSource) {}

  private get repo() {
    return this.db.getRepository(Resource);
  }

  async listResources() {
    return this.repo.find({ order: { createdAt: "DESC" } });
  }

  async findResourceById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async createResource(input: Partial<Resource> & { id?: string }) {
    return this.repo.save({ ...input, id: input.id ?? crypto.randomUUID() });
  }

  async updateResource(id: string, input: Partial<Resource>) {
    await this.repo.update({ id }, input);
    return this.repo.findOne({ where: { id } });
  }

  async deleteResourceById(id: string) {
    await this.repo.delete({ id });
    return { success: true };
  }
}
