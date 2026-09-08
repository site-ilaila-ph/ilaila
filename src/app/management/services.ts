"use server";

import { acquireCacheManager, acquirePrismaClient } from "@/lib/infra";

export async function getAllBusinessesForManagement() {
  const cache = acquireCacheManager();
  const db = acquirePrismaClient();
  return cache.cached({
    key: "allBusinessesForManagement",
    fn: async () =>
      await db.orm.Business
        .include("tags")
        .include("createdBy", (u) => u.select("email"))
        .orderBy((b) => b.createdAt.desc())
        .all(),
    ttlSeconds: 60 * 1000,
  });
}

export async function getBusinessById(id: string) {
  const cache = acquireCacheManager();
  const db = acquirePrismaClient();
  return cache.cached({
    key: `business:${id}`,
    fn: async () =>
      await db.orm.Business
        .where({ id })
        .include("tags")
        .include("images")
        .include("foods", (f) => f.include("food"))
        .include("reviews", (r) => r.include("user", (u) => u.select("email")))
        .first(),
    ttlSeconds: 60 * 1000,
  });
}

export async function getAllFoodsForManagement() {
  const cache = acquireCacheManager();
  const db = acquirePrismaClient();
  return cache.cached({
    key: "allFoodsForManagement",
    fn: async () =>
      await db.orm.Food
        .include("tags")
        .orderBy((f) => f.name.asc())
        .all(),
    ttlSeconds: 60 * 1000,
  });
}

export async function getFoodById(id: string) {
  const cache = acquireCacheManager();
  const db = acquirePrismaClient();
  return cache.cached({
    key: `food:${id}`,
    fn: async () =>
      await db.orm.Food
        .where({ id })
        .include("tags")
        .include("images")
        .include("businesses", (b) => b.include("business"))
        .first(),
    ttlSeconds: 60 * 1000,
  });
}

export async function getAllReviewsForManagement() {
  const db = acquirePrismaClient();
  return await db.orm.Review
    .include("user", (u) => u.select("email", "userName"))
    .include("business", (b) => b.select("name"))
    .orderBy((r) => r.createdAt.desc())
    .all();
}

export async function getAllUsersForManagement() {
  const cache = acquireCacheManager();
  const db = acquirePrismaClient();
  return cache.cached({
    key: "allUsersForManagement",
    fn: async () =>
      await db.orm.User
        .orderBy((u) => u.createdAt.desc())
        .all(),
    ttlSeconds: 60 * 1000,
  });
}

export async function getManagementStats() {
  const cache = acquireCacheManager();
  const db = acquirePrismaClient();
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
        db.orm.User.count(),
        db.orm.Business.count(),
        db.orm.Food.count(),
        db.orm.Review.count(),
        db.orm.AppReview.count(),
        db.orm.AppReview.where({ isApproved: false }).count(),
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
