"use server";

import { acquirePrismaClient } from "@/lib/infra";

export async function getAllAppReviews() {
  const db = acquirePrismaClient();
  return await db.orm.AppReview
    .include("user", (user) => user.select("email", "userName"))
    .orderBy((r) => r.createdAt.desc())
    .all();
}

export async function getApprovedAppReviews() {
  const db = acquirePrismaClient();
  return await db.orm.AppReview
    .where({ isApproved: true })
    .include("user", (user) => user.select("email", "userName"))
    .orderBy((r) => r.createdAt.desc())
    .all();
}

export async function getPendingAppReviews() {
  const db = acquirePrismaClient();
  return await db.orm.AppReview
    .where({ isApproved: false })
    .include("user", (user) => user.select("email", "userName"))
    .orderBy((r) => r.createdAt.desc())
    .all();
}

export async function getAppReviewStats() {
  const db = acquirePrismaClient();
  const [total, approved, pending, avgRatingResult] = await Promise.all([
    db.orm.AppReview.count(),
    db.orm.AppReview.where({ isApproved: true }).count(),
    db.orm.AppReview.where({ isApproved: false }).count(),
    db.orm.AppReview.aggregate((a) => ({ avg: a.avg("rating") })),
  ]);

  return {
    total,
    approved,
    pending,
    averageRating: avgRatingResult.avg || 0,
  };
}
