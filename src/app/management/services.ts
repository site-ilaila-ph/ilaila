"use server";

import { acquireCacheManager, acquireDb } from "@/lib/live";

const MANAGEMENT_CACHE_KEYS = {
  businesses: ["management", "businesses"],
  foods: ["management", "foods"],
  reviews: ["management", "reviews"],
  users: ["management", "users"],
  stats: ["management", "stats"],
} as const;

export async function invalidateManagementCache(
  ...keys: (keyof typeof MANAGEMENT_CACHE_KEYS)[]
) {
  const cache = acquireCacheManager();
  await Promise.all(keys.map((key) => cache.invalidate({ key: MANAGEMENT_CACHE_KEYS[key] })));
}

export async function getAllBusinessesForManagement() {
  const db = acquireDb();
  return await acquireCacheManager().cached({
    key: MANAGEMENT_CACHE_KEYS.businesses,
    ttlSeconds: 30,
    fn: () => db.business.findMany({
      include: {
        tags: true,
        createdBy: { select: { email: true } },
        _count: { select: { reviews: true, foods: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  });
}

export async function getBusinessById(id: string) {
  const db = acquireDb();
  return await db.business.findUnique({
    where: { id },
    include: {
      tags: true,
      images: true,
      foods: { include: { food: true } },
      reviews: { include: { user: { select: { email: true } } } },
    },
  });
}

export async function getAllFoodsForManagement() {
  const db = acquireDb();
  return await acquireCacheManager().cached({
    key: MANAGEMENT_CACHE_KEYS.foods,
    ttlSeconds: 30,
    fn: () => db.food.findMany({
      include: {
        tags: true,
        _count: { select: { businesses: true, images: true } },
      },
      orderBy: { name: "asc" },
    }),
  });
}

export async function getFoodById(id: string) {
  const db = acquireDb();
  return await db.food.findUnique({
    where: { id },
    include: {
      tags: true,
      images: true,
      businesses: { include: { business: true } },
    },
  });
}

export async function getAllReviewsForManagement() {
  const db = acquireDb();
  return await acquireCacheManager().cached({
    key: MANAGEMENT_CACHE_KEYS.reviews,
    ttlSeconds: 30,
    fn: () => db.review.findMany({
      include: {
        user: { select: { email: true, userName: true } },
        business: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  });
}

export async function getAllUsersForManagement() {
  const db = acquireDb();
  return await acquireCacheManager().cached({
    key: MANAGEMENT_CACHE_KEYS.users,
    ttlSeconds: 30,
    fn: () => db.user.findMany({
      include: {
        _count: { select: { reviews: true, bookmarks: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  });
}

export async function getManagementStats() {
  const db = acquireDb();
  return await acquireCacheManager().cached({
    key: MANAGEMENT_CACHE_KEYS.stats,
    ttlSeconds: 15,
    fn: async () => {
      const [userCount, businessCount, foodCount, reviewCount, appReviewCount, pendingAppReviewCount] = await Promise.all([
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
