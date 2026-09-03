"use server";

import { acquireDb } from "@/lib/live";

export async function getAllAppReviews() {
  const db = acquireDb();
  return await db.appReview.findMany({
    include: {
      user: {
        select: { email: true, userName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApprovedAppReviews() {
  const db = acquireDb();
  return await db.appReview.findMany({
    where: { isApproved: true },
    include: {
      user: {
        select: { email: true, userName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingAppReviews() {
  const db = acquireDb();
  return await db.appReview.findMany({
    where: { isApproved: false },
    include: {
      user: {
        select: { email: true, userName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAppReviewStats() {
  const db = acquireDb();
  const [total, approved, pending, averageRating] = await Promise.all([
    db.appReview.count(),
    db.appReview.count({ where: { isApproved: true } }),
    db.appReview.count({ where: { isApproved: false } }),
    db.appReview.aggregate({
      _avg: { rating: true },
    }),
  ]);

  return {
    total,
    approved,
    pending,
    averageRating: averageRating._avg.rating || 0,
  };
}
