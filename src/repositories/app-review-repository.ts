import { AppReview } from "@/entities";
import { injectable } from "inversify";
import { DataSource } from "typeorm";

@injectable()
export class AppReviewRepository {
  public constructor(
    private readonly db: DataSource,
  ) { }

  private get repo() {
    return this.db.getRepository(AppReview);
  }

  async listAppReviews() {
    return this.repo.find({
      order: {
        createdAt: "DESC",
      },
    });
  }

  async createAppReview(input: {
    userId?: string;
    userName?: string;
    email?: string;
    rating: number;
    text: string;
  }) {
    return this.repo.insert({
      id: crypto.randomUUID(),
      ...input,
    });
  }

  async updateAppReviewStatus(
    id: string,
    isApproved: boolean,
  ) {
    return this.repo.update(
      { id },
      { isApproved },
    );
  }

  async deleteAppReview(id: string) {
    await this.repo.delete({ id });

    return {
      success: true,
    };
  }

  async getAppReviewStats() {
    const [total, approved, pending, avg] =
      await Promise.all([
        this.repo.count(),

        this.repo.count({
          where: {
            isApproved: true,
          },
        }),

        this.repo.count({
          where: {
            isApproved: false,
          },
        }),

        this.repo
          .createQueryBuilder("appReview")
          .select(
            "AVG(appReview.rating)",
            "avg",
          )
          .getRawOne<{ avg: string | null }>(),
      ]);

    return {
      total,
      approved,
      pending,
      averageRating: avg?.avg ?? 0,
    };
  }

  async getAllAppReviews() {
    return this.listAppReviews();
  }

  async getApprovedAppReviews() {
    return this.repo.find({
      where: {
        isApproved: true,
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  async getPendingAppReviews() {
    return this.repo.find({
      where: {
        isApproved: false,
      },
      order: {
        createdAt: "DESC",
      },
    });
  }
}
