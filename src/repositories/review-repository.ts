import { injectable } from "inversify";
import { DataSource } from "typeorm";
import { Review } from "@/entities";

@injectable()
export class ReviewRepository {
  public constructor(private readonly db: DataSource) {}

  private get repo() {
    return this.db.getRepository(Review);
  }

  async listAllReviews() {
    return this.repo.find({
      relations: { user: true, business: true },
      order: { createdAt: "DESC" },
    });
  }

  async listReviewsForBusiness(id: string) {
    return this.repo.createQueryBuilder().where("businessId = :id", { id }).orderBy("createdAt", "DESC").getMany();
  }

  async createReview(input: {
    businessId: string;
    userId: string;
    text: string;
    foodQuality: number;
    service: number;
    ambiance: number;
    value: number;
  }) {
    return this.repo.create({
      id: crypto.randomUUID(),
      businessId: input.businessId,
      userId: input.userId,
      text: input.text,
      foodQuality: input.foodQuality,
      service: input.service,
      ambiance: input.ambiance,
      value: input.value,
    });
  }

  async updateReview(id: string, input: Partial<{ text: string; foodQuality: number; service: number; ambiance: number; value: number; upvote?: boolean }>) {
    if (input.upvote) {
      const current = await this.repo.findOne({ where: { id } });
      const newUpvotes = (current?.upvotes ?? 0) + 1;
      await this.repo.update({ id }, { upvotes: newUpvotes });
      return this.repo.findOne({ where: { id } });
    }
    await this.repo.update({ id }, input);
    return this.repo.findOne({ where: { id } });
  }

  async deleteReview(id: string) {
    await this.repo.delete({ id });
    return { success: true };
  }

  async deleteReviewById(id: string) {
    await this.repo.delete({ id });
    return { success: true };
  }
}
