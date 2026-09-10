import { NextResponse } from "next/server";
import { acquirePrismaClient } from "@/lib/infra";

export async function GET() {
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

  return NextResponse.json({
    users: userCount,
    businesses: businessCount,
    foods: foodCount,
    reviews: reviewCount,
    appReviews: appReviewCount,
    pendingAppReviews: pendingAppReviewCount,
  }, { status: 200 });
}
