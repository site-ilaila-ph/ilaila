"use server";

import { ServerError } from "@/lib/action/server";
import { acquireCacheManager, acquireDb, acquireNextJSCookieMap } from "@/lib/live";
import { createSessionReader } from "@/lib/session/server";

export async function requireAdmin() {
  const session = createSessionReader({
    db: acquireDb(),
    cache: acquireCacheManager(),
    cookieMap: await acquireNextJSCookieMap(),
  });
  const user = await session.getSessionUser();

  if (!user?.isAdmin) {
    throw new ServerError({
      domain: "authorization",
      hint: "admin-required",
      message: "Administrator access is required.",
      sensitive: false,
    });
  }
}

export async function getAllAppReviews() {
  await requireAdmin();
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
    select: {
      id: true,
      userName: true,
      rating: true,
      text: true,
      createdAt: true,
      user: {
        select: { userName: true },
      },  
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingAppReviews() {
  await requireAdmin();
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
  await requireAdmin();
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
