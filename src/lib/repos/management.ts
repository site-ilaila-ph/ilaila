import { acquirePrismaClient } from "@/lib/infra";

export async function getDashboardCounts() {
  const db = acquirePrismaClient();
  const [
    userCount,
    businessCount,
    foodCount,
    reviewCount,
    appReviewCount,
    pendingAppReviewCount,
  ] = await Promise.all([
    db.userData.count(),
    db.business.count(),
    db.food.count(),
    db.businessReview.count(),
    db.appReview.count(),
    db.appReview.count({ where: { isApproved: false } }),
  ]);
  return {
    users: userCount,
    businesses: businessCount,
    foods: foodCount,
    reviews: reviewCount,
    appReviews: appReviewCount,
    pendingAppReviews: pendingAppReviewCount,
  };
}
