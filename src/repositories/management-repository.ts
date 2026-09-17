import { acquireDatabase } from "@/lib/database";
import { UserData, Business, Food, Review, AppReview } from "@/entities";

export async function getDashboardCounts() {
  const db = await acquireDatabase();
  const [userCount, businessCount, foodCount, reviewCount, appReviewCount, pendingAppReviewCount] = await Promise.all([
    db.getRepository(UserData).count(),
    db.getRepository(Business).count(),
    db.getRepository(Food).count(),
    db.getRepository(Review).count(),
    db.getRepository(AppReview).count(),
    db.getRepository(AppReview).count({ where: { isApproved: false } }),
  ]);
  return { users: userCount, businesses: businessCount, foods: foodCount, reviews: reviewCount, appReviews: appReviewCount, pendingAppReviews: pendingAppReviewCount };
}
