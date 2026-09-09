"use server";

import { ServerError, toServerAction } from "@/lib/action/server";
import { acquireDb, acquireNextJSCookieMap } from "@/lib/live";
import z from "zod";
import type { PrismaClient } from "@/generated/prisma/client";

const adminActionDependencies = () => ({
  db: acquireDb(),
});

async function requireAdminUser() {
  const cookieMap = await acquireNextJSCookieMap();
  const sessionId = cookieMap.get("SESSION_TOKEN");
  const session = sessionId
    ? await acquireDb().session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      })
    : null;

  if (!session || session.expiresAt <= new Date() || !session.user.isAdmin) {
    throw new ServerError({
      domain: "authorization",
      hint: "admin-required",
      message: "Administrator access is required.",
      sensitive: false,
    });
  }

  return session.user;
}

// ============ BUSINESS MANAGEMENT ============

const createBusinessSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  history: z.string().optional(),
  address: z.string().trim().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  hours: z.string().min(1),
  tags: z.array(z.string()).optional(),
  coverImageUrl: z.string().min(1).optional(),
  galleryImageUrls: z.array(z.string().min(1)).max(10).optional(),
});

export const createBusinessAction = toServerAction({
  serviceFn: async (
    input: z.infer<typeof createBusinessSchema>,
    deps: { db: Pick<PrismaClient, "business" | "businessTag"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    const user = await requireAdminUser();
    
    const business = await db.business.create({
      data: {
        name: input.name,
        description: input.description,
        history: input.history,
        address: input.address,
        latitude: input.latitude ?? 14.3595,
        longitude: input.longitude ?? 121.0473,
        hours: input.hours,
        createdById: user.id,
        images: input.coverImageUrl || input.galleryImageUrls?.length
          ? { create: [
              ...(input.coverImageUrl ? [{ url: input.coverImageUrl, description: "Cover image", isCover: true }] : []),
              ...(input.galleryImageUrls ?? []).map((url) => ({ url, description: "Gallery image", isCover: false })),
            ] }
          : undefined,
      },
    });

    if (input.tags && input.tags.length > 0) {
      await Promise.all(
        input.tags.map(tag =>
          db.businessTag.create({
            data: { value: tag, businessId: business.id },
          })
        )
      );
    }

    return business;
  },
  schema: createBusinessSchema,
  dependencies: adminActionDependencies,
});

const updateBusinessSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  history: z.string().optional(),
  address: z.string().trim().min(5).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  hours: z.string().min(1).optional(),
  isPublished: z.boolean().optional(),
  coverImageUrl: z.string().min(1).optional(),
  galleryImageUrls: z.array(z.string().min(1)).max(10).optional(),
});

export const updateBusinessAction = toServerAction({
  serviceFn: async (
    input: z.infer<typeof updateBusinessSchema>,
    deps: { db: Pick<PrismaClient, "business" | "businessImage"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await requireAdminUser();
    
    const { id, ...data } = input;
    
    const updatedBusiness = await db.business.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.history !== undefined && { history: data.history }),
        ...(data.address && { address: data.address }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.hours && { hours: data.hours }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      },
    });

    if (data.coverImageUrl || data.galleryImageUrls?.length) {
      if (data.coverImageUrl) {
        await db.businessImage.updateMany({ where: { businessId: id }, data: { isCover: false } });
      }
      await db.businessImage.createMany({
        data: [
          ...(data.coverImageUrl ? [{ businessId: id, url: data.coverImageUrl, description: "Cover image", isCover: true }] : []),
          ...(data.galleryImageUrls ?? []).map((url) => ({ businessId: id, url, description: "Gallery image", isCover: false })),
        ],
      });
    }

    return updatedBusiness;
  },
  schema: updateBusinessSchema,
  dependencies: adminActionDependencies,
});

export const deleteBusinessAction = toServerAction({
  serviceFn: async (
    id: string,
    deps: { db: PrismaClient } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await requireAdminUser();

    await db.$transaction([
      db.businessImage.deleteMany({ where: { businessId: id } }),
      db.businessTag.deleteMany({ where: { businessId: id } }),
      db.menuItem.deleteMany({ where: { businessId: id } }),
      db.businessFood.deleteMany({ where: { businessId: id } }),
      db.review.deleteMany({ where: { businessId: id } }),
      db.bookmark.deleteMany({ where: { businessId: id } }),
      db.business.delete({ where: { id } }),
    ]);

    return { id };
  },
  schema: z.string(),
  dependencies: adminActionDependencies,
});

// ============ FOOD MANAGEMENT ============

const createFoodSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  history: z.string().min(1),
  preparation: z.string().min(1),
  recipe: z.string().min(1),
  culturalSignificance: z.string().min(1),
  isHeritage: z.boolean().default(true),
  businessId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const createFoodAction = toServerAction({
  serviceFn: async (
    input: z.infer<typeof createFoodSchema>,
    deps: { db: Pick<PrismaClient, "food" | "foodTag" | "businessFood"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await requireAdminUser();
    
    const food = await db.food.create({
      data: {
        name: input.name,
        description: input.description,
        history: input.history,
        preparation: input.preparation,
        recipe: input.recipe,
        culturalSignificance: input.culturalSignificance,
        isHeritage: input.isHeritage,
      },
    });

    if (input.tags && input.tags.length > 0) {
      await Promise.all(
        input.tags.map(tag =>
          db.foodTag.create({
            data: { value: tag, foodId: food.id },
          })
        )
      );
    }

    if (input.businessId) {
      await db.businessFood.create({ data: { businessId: input.businessId, foodId: food.id } });
    }

    return food;
  },
  schema: createFoodSchema,
  dependencies: adminActionDependencies,
});

const updateFoodSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  history: z.string().optional(),
  preparation: z.string().optional(),
  recipe: z.string().optional(),
  culturalSignificance: z.string().optional(),
  isHeritage: z.boolean().optional(),
});

export const updateFoodAction = toServerAction({
  serviceFn: async (
    input: z.infer<typeof updateFoodSchema>,
    deps: { db: Pick<PrismaClient, "food"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await requireAdminUser();
    
    const { id, ...data } = input;
    
    return await db.food.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.history && { history: data.history }),
        ...(data.preparation && { preparation: data.preparation }),
        ...(data.recipe && { recipe: data.recipe }),
        ...(data.culturalSignificance && { culturalSignificance: data.culturalSignificance }),
        ...(data.isHeritage !== undefined && { isHeritage: data.isHeritage }),
      },
    });
  },
  schema: updateFoodSchema,
  dependencies: adminActionDependencies,
});

export const deleteFoodAction = toServerAction({
  serviceFn: async (
    id: string,
    deps: { db: Pick<PrismaClient, "food"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await requireAdminUser();
    return await db.food.delete({ where: { id } });
  },
  schema: z.string(),
  dependencies: adminActionDependencies,
});

// ============ REVIEW MANAGEMENT ============

export const deleteReviewAction = toServerAction({
  serviceFn: async (
    id: string,
    deps: { db: Pick<PrismaClient, "review"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await requireAdminUser();
    return await db.review.delete({ where: { id } });
  },
  schema: z.string(),
  dependencies: adminActionDependencies,
});

export const updateReviewStatusAction = toServerAction({
  serviceFn: async (
    { id, isApproved }: { id: string; isApproved: boolean },
    deps: { db: Pick<PrismaClient, "review"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await requireAdminUser();
    void isApproved;
    // Would update a review status/moderation field if added to schema
    return await db.review.findUnique({ where: { id } });
  },
  schema: z.object({ id: z.string(), isApproved: z.boolean() }),
  dependencies: adminActionDependencies,
});

// ============ USER MANAGEMENT ============

export const updateUserRoleAction = toServerAction({
  serviceFn: async (
    { userId, isAdmin }: { userId: string; isAdmin: boolean },
    deps: { db: Pick<PrismaClient, "user"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await requireAdminUser();
    return await db.user.update({
      where: { id: userId },
      data: { isAdmin },
    });
  },
  schema: z.object({ userId: z.string(), isAdmin: z.boolean() }),
  dependencies: adminActionDependencies,
});

export const deleteUserAction = toServerAction({
  serviceFn: async (
    userId: string,
    deps: { db: Pick<PrismaClient, "user"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await requireAdminUser();
    return await db.user.delete({ where: { id: userId } });
  },
  schema: z.string(),
  dependencies: adminActionDependencies,
});
