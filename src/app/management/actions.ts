"use server";

import { toServerAction } from "@/lib/action/server";
import { PrismaClient} from "@/generated/prisma/client";
import { acquirePrismaClient, acquireStorageManager } from "@/lib/infra";
import z from "zod";

const adminActionDependencies = () => ({
  db: acquirePrismaClient(),
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
    deps: { db: PrismaClient } = adminActionDependencies(),
  ) => {
    const db = deps.db;

    const business = await db.orm.Business.create({
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      history: input.history || null,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      hours: input.hours,
      createdById: "system",
      isPublished: true,
    });

    if (input.imageData) {
      await db.businesses.create({
        id: crypto.randomUUID(),
        businessId: business.id,
        description: "Business image",
        url: await saveImage(input.imageData, `businesses/${business.id}`),
      });
    }

    if (input.tags && input.tags.length > 0) {
      await Promise.all(
        input.tags.map(tag =>
          db.orm.BusinessTag.create({
            id: crypto.randomUUID(),
            value: tag,
            businessId: business.id,
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
    deps: { db: PostgresClient<Contract> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    
    const { id, ...data } = input;
    
    const updateData: Record<string, any> = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.history !== undefined) updateData.history = data.history;
    if (data.address) updateData.address = data.address;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.hours) updateData.hours = data.hours;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    await db.orm.Business.where({ id }).update(updateData);
    const business = await db.orm.Business.where({ id }).first();

    if (input.imageData) {
      await db.orm.BusinessImage.create({
        id: crypto.randomUUID(),
        businessId: id,
        description: "Business image",
        url: await saveImage(input.imageData, `businesses/${id}-${Date.now()}`),
      });
    }

    return business;
  },
  schema: updateBusinessSchema,
  dependencies: adminActionDependencies,
});

export const deleteBusinessAction = toServerAction({
  serviceFn: async (
    id: string,
    deps: { db: PostgresClient<Contract> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await db.orm.Business.where({ id }).delete();
    return { success: true };
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
    deps: { db: PostgresClient<Contract> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    
    const food = await db.orm.Food.create({
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      history: input.history,
      preparation: input.preparation,
      recipe: input.recipe,
      culturalSignificance: input.culturalSignificance,
      isHeritage: input.isHeritage,
    });

    if (input.imageData) {
      await db.orm.FoodImage.create({
        id: crypto.randomUUID(),
        foodId: food.id,
        description: "Food image",
        url: await saveImage(input.imageData, `foods/${food.id}`),
      });
    }

    if (input.tags && input.tags.length > 0) {
      await Promise.all(
        input.tags.map(tag =>
          db.orm.FoodTag.create({
            id: crypto.randomUUID(),
            value: tag,
            foodId: food.id,
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
    deps: { db: PostgresClient<Contract> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    
    const { id, ...data } = input;
    
    const updateData: Record<string, any> = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.history) updateData.history = data.history;
    if (data.preparation) updateData.preparation = data.preparation;
    if (data.recipe) updateData.recipe = data.recipe;
    if (data.culturalSignificance) updateData.culturalSignificance = data.culturalSignificance;
    if (data.isHeritage !== undefined) updateData.isHeritage = data.isHeritage;

    await db.orm.Food.where({ id }).update(updateData);
    const food = await db.orm.Food.where({ id }).first();

    if (input.imageData) {
      await db.orm.FoodImage.create({
        id: crypto.randomUUID(),
        foodId: id,
        description: "Food image",
        url: await saveImage(input.imageData, `foods/${id}-${Date.now()}`),
      });
    }

    return food;
  },
  schema: updateFoodSchema,
  dependencies: adminActionDependencies,
});

export const deleteFoodAction = toServerAction({
  serviceFn: async (
    id: string,
    deps: { db: PostgresClient<Contract> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await db.orm.Food.where({ id }).delete();
    return { success: true };
  },
  schema: z.string(),
  dependencies: adminActionDependencies,
});

// ============ REVIEW MANAGEMENT ============

export const deleteReviewAction = toServerAction({
  serviceFn: async (
    id: string,
    deps: { db: PostgresClient<Contract> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await db.orm.Review.where({ id }).delete();
    return { success: true };
  },
  schema: z.string(),
  dependencies: adminActionDependencies,
});

export const updateReviewStatusAction = toServerAction({
  serviceFn: async (
    { id, isApproved }: { id: string; isApproved: boolean },
    deps: { db: PostgresClient<Contract> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    void isApproved;
    return await db.orm.Review.where({ id }).first();
  },
  schema: z.object({ id: z.string(), isApproved: z.boolean() }),
  dependencies: adminActionDependencies,
});

// ============ USER MANAGEMENT ============

export const updateUserRoleAction = toServerAction({
  serviceFn: async (
    { userId, isAdmin }: { userId: string; isAdmin: boolean },
    deps: { db: PostgresClient<Contract> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await db.orm.User.where({ id: userId }).update({ isAdmin });
    return await db.orm.User.where({ id: userId }).first();
  },
  schema: z.object({ userId: z.string(), isAdmin: z.boolean() }),
  dependencies: adminActionDependencies,
});

export const deleteUserAction = toServerAction({
  serviceFn: async (
    userId: string,
    deps: { db: PostgresClient<Contract> } = adminActionDependencies(),
  ) => {
    const db = deps.db;
    await db.orm.User.where({ id: userId }).delete();
    return { success: true };
  },
  schema: z.string(),
  dependencies: adminActionDependencies,
});
