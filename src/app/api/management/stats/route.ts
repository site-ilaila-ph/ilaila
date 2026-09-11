import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { acquirePrismaClient } from "@/lib/infra";
import { internalErrorProblem, ok } from "@/lib/responses";

function mapManagementStatsFailure(request: NextRequest, error: unknown): NextResponse {
  console.error("Management stats read failed", error);
  return internalErrorProblem(request, { detail: "Unable to load dashboard stats right now. Please try again later." });
}

async function getStats(req: NextRequest) {
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
    return mapManagementStatsFailure(req, error);
  }
}

export const GET = withLogging(getStats, {
  name: "getStats",
  redact: { headers: ["authorization", "cookie"] },
});
