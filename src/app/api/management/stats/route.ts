import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient } from "@/lib/infra";
import { ok } from "@/lib/responses";

export const runtime = "nodejs";

async function getStats() {
    try {
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
      db.review.count(),
      db.appReview.count(),
      db.appReview.count({ where: { isApproved: false } }),
    ]);

    return ok({
      users: userCount,
      businesses: businessCount,
      foods: foodCount,
      reviews: reviewCount,
      appReviews: appReviewCount,
      pendingAppReviews: pendingAppReviewCount,
    });
  } catch (error: unknown) {
    console.error("Management stats read failed", error);
    throw error;
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getStats), "getStats");
