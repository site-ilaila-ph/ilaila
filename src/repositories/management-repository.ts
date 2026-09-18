import { injectable } from "inversify";
import { DataSource } from "typeorm";
import { UserData, Business, Food, Review, AppReview } from "@/entities";

@injectable()
export class ManagementRepository {
  public constructor(private readonly db: DataSource) {}

  async getDashboardCounts() {
    const [userCount, businessCount, foodCount, reviewCount, appReviewCount, pendingAppReviewCount] = await Promise.all([
      this.db.getRepository(UserData).count(),
      this.db.getRepository(Business).count(),
      this.db.getRepository(Food).count(),
      this.db.getRepository(Review).count(),
      this.db.getRepository(AppReview).count(),
      this.db.getRepository(AppReview).count({ where: { isApproved: false } }),
    ]);
    return { users: userCount, businesses: businessCount, foods: foodCount, reviews: reviewCount, appReviews: appReviewCount, pendingAppReviews: pendingAppReviewCount };
  }
}
