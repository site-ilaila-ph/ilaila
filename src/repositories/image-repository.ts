import { injectable } from "inversify";
import { DataSource } from "typeorm";
import { Image } from "@/entities";

@injectable()
export class ImageRepository {
  public constructor(private readonly db: DataSource) {}

  private get repo() {
    return this.db.getRepository(Image);
  }

  async listImages(parentType?: string, parentId?: string) {
    if (parentType && parentId) {
      return this.repo.find({ where: { parentType, parentId } });
    }
    if (parentType) {
      return this.repo.find({ where: { parentType } });
    }
    return this.repo.find();
  }

  async findImageById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async createImage(input: Partial<Image> & { id?: string }) {
    return this.repo.save({ ...input, id: input.id ?? crypto.randomUUID() });
  }

  async updateImage(id: string, input: Partial<Image>) {
    await this.repo.update({ id }, input);
    return this.repo.findOne({ where: { id } });
  }

  async deleteImageById(id: string) {
    await this.repo.delete({ id });
    return { success: true };
  }
}
