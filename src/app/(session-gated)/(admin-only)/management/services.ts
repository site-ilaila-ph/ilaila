"use server";

import { acquireCacheManager, acquireDb } from "@/lib/infra";

export async function getAllBusinessesForManagement() {
  const cache = acquireCacheManager();
  const db = acquireDb();
  return cache.cached({
    key: "allBusinessesForManagement",
    fn: async () =>
      await db.business.findMany({
        include: {
          tags: true,
          createdBy: { select: { email: true } },
          _count: { select: { reviews: true, foods: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ttlSeconds: 60 * 1000, // 1 minute
  });
}

export async function getBusinessById(id: string) {
  const cache = acquireCacheManager();
  const db = acquireDb();
  return cache.cached({
    key: `business:${id}`,
    fn: async () =>
      await db.business.findUnique({
        where: { id },
        include: {
          tags: true,
          images: true,
          foods: { include: { food: true } },
          reviews: { include: { user: { select: { email: true } } } },
        },
      }),
    ttlSeconds: 60 * 1000, // 1 minute
  });
}

export async function getAllFoodsForManagement() {
  const cache = acquireCacheManager();
  const db = acquireDb();
  return cache.cached({
    key: "allFoodsForManagement",
    fn: async () =>
      await db.food.findMany({
        include: {
          tags: true,
          _count: { select: { businesses: true, images: true } },
        },
        orderBy: { name: "asc" },
      }),
    ttlSeconds: 60 * 1000, // 1 minute
  });
}

export async function getFoodById(id: string) {
  const cache = acquireCacheManager();
  const db = acquireDb();
  return cache.cached({
    key: `food:${id}`,
    fn: async () =>
      await db.food.findUnique({
        where: { id },
        include: {
          tags: true,
          images: true,
          businesses: { include: { business: true } },
        },
      }),
    ttlSeconds: 60 * 1000, // 1 minute
  });
}

export async function getAllReviewsForManagement() {
  const db = acquireDb();
  return await db.review.findMany({
    include: {
      user: { select: { email: true, userName: true } },
      business: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllUsersForManagement() {
  const cache = acquireCacheManager();
  const db = acquireDb();
  return cache.cached({
    key: "allUsersForManagement",
    fn: async () =>
      await db.user.findMany({
        include: {
          _count: { select: { reviews: true, bookmarks: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ttlSeconds: 60 * 1000, // 1 minute
  });
}

export async function getManagementStats() {
  const cache = acquireCacheManager();
  const db = acquireDb();
  return cache.cached({
    key: "managementStats",
    fn: async () => {
      const [
        userCount,
        businessCount,
        foodCount,
        reviewCount,
        appReviewCount,
        pendingAppReviewCount,
      ] = await Promise.all([
        db.user.count(),
        db.business.count(),
        db.food.count(),
        db.review.count(),
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
    },
  });
}
