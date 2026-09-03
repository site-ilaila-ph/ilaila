"use server";

import { toServerAction } from "@/lib/action/server";
import { acquireDb, acquireStorageManager } from "@/lib/live";
import z from "zod";
import type { PrismaClient } from "@/generated/prisma/client";

const adminActionDependencies = () => ({
  db: acquireDb(),
});

async function saveImage(dataUrl: string, key: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
  if (!match) throw new Error("Invalid image format");
  if (process.env.NODE_ENV !== "production" && !process.env.BLOB_READ_WRITE_TOKEN) {
    return dataUrl;
  }
  const [, contentType, encoded] = match;
  const bytes = Uint8Array.from(Buffer.from(encoded, "base64"));
  const blob = await acquireStorageManager().upload({
    key: ["management", key],
    fileOrBody: new Blob([bytes], { type: contentType }),
    options: { access: "public", contentType },
  });
  return blob.url;
}

// ============ BUSINESS MANAGEMENT ============

const createBusinessSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  history: z.string().optional(),
  address: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  hours: z.string().min(1),
  tags: z.array(z.string()).optional(),
  imageData: z.string().optional(),
});

export const createBusinessAction = toServerAction({
  serviceFn: async (
    input: z.infer<typeof createBusinessSchema>,
    deps: { db: Pick<PrismaClient, "business" | "businessTag" | "businessImage"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;

    const business = await db.business.create({
      data: {
        name: input.name,
        description: input.description,
        history: input.history,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        hours: input.hours,
        createdById: "system", // Will be updated with actual user ID from session
      },
    });

    if (input.imageData) {
      await db.businessImage.create({ data: { businessId: business.id, description: "Business image", url: await saveImage(input.imageData, `businesses/${business.id}`) } });
    }

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
  address: z.string().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  hours: z.string().min(1).optional(),
  isPublished: z.boolean().optional(),
  imageData: z.string().optional(),
});

export const updateBusinessAction = toServerAction({
  serviceFn: async (
    input: z.infer<typeof updateBusinessSchema>,
    deps: { db: Pick<PrismaClient, "business" | "businessImage"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    
    const { id, ...data } = input;
    
    const business = await db.business.update({
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

    if (input.imageData) {
      await db.businessImage.create({ data: { businessId: id, description: "Business image", url: await saveImage(input.imageData, `businesses/${id}-${Date.now()}`) } });
    }

    return business;
  },
  schema: updateBusinessSchema,
  dependencies: adminActionDependencies,
});

export const deleteBusinessAction = toServerAction({
  serviceFn: async (
    id: string,
    deps: { db: Pick<PrismaClient, "business"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    return await db.business.delete({ where: { id } });
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
  tags: z.array(z.string()).optional(),
  imageData: z.string().optional(),
});

export const createFoodAction = toServerAction({
  serviceFn: async (
    input: z.infer<typeof createFoodSchema>,
    deps: { db: Pick<PrismaClient, "food" | "foodTag" | "foodImage"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    
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

    if (input.imageData) {
      await db.foodImage.create({ data: { foodId: food.id, description: "Food image", url: await saveImage(input.imageData, `foods/${food.id}`) } });
    }

    if (input.tags && input.tags.length > 0) {
      await Promise.all(
        input.tags.map(tag =>
          db.foodTag.create({
            data: { value: tag, foodId: food.id },
          })
        )
      );
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
  imageData: z.string().optional(),
});

export const updateFoodAction = toServerAction({
  serviceFn: async (
    input: z.infer<typeof updateFoodSchema>,
    deps: { db: Pick<PrismaClient, "food" | "foodImage"> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    
    const { id, ...data } = input;
    
    const food = await db.food.update({
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

    if (input.imageData) {
      await db.foodImage.create({ data: { foodId: id, description: "Food image", url: await saveImage(input.imageData, `foods/${id}-${Date.now()}`) } });
    }

    return food;
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
    return await db.user.delete({ where: { id: userId } });
  },
  schema: z.string(),
  dependencies: adminActionDependencies,
});
