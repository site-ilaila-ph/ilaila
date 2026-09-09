"use server";

import { acquirePrismaClient, acquireStorageManager } from "@/lib/infra";
import z from "zod";

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

export const createBusinessAction = async (input: z.infer<typeof createBusinessSchema>) => {
  const db = acquirePrismaClient();
  const business = await db.business.create({
    data: {
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
    },
  });
  if (input.imageData) {
    await db.businessImage.create({
      data: {
        id: crypto.randomUUID(),
        businessId: business.id,
        description: "Business image",
        url: await saveImage(input.imageData, `businesses/${business.id}`),
      },
    });
  }
  return business;
};

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

export const updateBusinessAction = async (input: z.infer<typeof updateBusinessSchema>) => {
  const db = acquirePrismaClient();
  const { id, ...data } = input;
  await db.business.update({ where: { id }, data: { ...data } });
  const business = await db.business.findUnique({ where: { id } });
  if (input.imageData) {
    await db.businessImage.create({
      data: {
        id: crypto.randomUUID(),
        businessId: id,
        description: "Business image",
        url: await saveImage(input.imageData, `businesses/${id}-${Date.now()}`),
      },
    });
  }
  return business;
};

export const deleteBusinessAction = async (id: string) => {
  const db = acquirePrismaClient();
  await db.business.delete({ where: { id } });
  return { success: true };
};

const createFoodSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  history: z.string().optional(),
  preparation: z.string().optional(),
  recipe: z.string().optional(),
  culturalSignificance: z.string().optional(),
  isHeritage: z.boolean().optional(),
  imageData: z.string().optional(),
});

export const createFoodAction = async (input: z.infer<typeof createFoodSchema>) => {
  const db = acquirePrismaClient();
  const food = await db.food.create({
    data: {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      history: input.history || "",
      preparation: input.preparation || "",
      recipe: input.recipe || "",
      culturalSignificance: input.culturalSignificance || "",
      isHeritage: input.isHeritage ?? true,
    },
  });
  if (input.imageData) {
    await db.foodImage.create({
      data: {
        id: crypto.randomUUID(),
        foodId: food.id,
        description: "Food image",
        url: await saveImage(input.imageData, `foods/${food.id}`),
      },
    });
  }
  return food;
};

const updateFoodSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  history: z.string().optional(),
  preparation: z.string().optional(),
  recipe: z.string().optional(),
  culturalSignificance: z.string().optional(),
  isHeritage: z.boolean().optional(),
  imageData: z.string().optional(),
});

export const updateFoodAction = async (input: z.infer<typeof updateFoodSchema>) => {
  const db = acquirePrismaClient();
  const { id, imageData, ...data } = input;
  await db.food.update({ where: { id }, data: { ...data } });
  const food = await db.food.findUnique({ where: { id } });
  if (imageData) {
    await db.foodImage.create({
      data: {
        id: crypto.randomUUID(),
        foodId: id,
        description: "Food image",
        url: await saveImage(imageData, `foods/${id}-${Date.now()}`),
      },
    });
  }
  return food;
};

export const deleteFoodAction = async (id: string) => {
  const db = acquirePrismaClient();
  await db.food.delete({ where: { id } });
  return { success: true };
};

export const deleteReviewAction = async (id: string) => {
  const db = acquirePrismaClient();
  await db.review.delete({ where: { id } });
  return { success: true };
};

const updateUserRoleSchema = z.object({
  userId: z.string(),
  isAdmin: z.boolean(),
});

export const updateUserRoleAction = async (input: z.infer<typeof updateUserRoleSchema>) => {
  const db = acquirePrismaClient();
  await db.user.update({ where: { id: input.userId }, data: { isAdmin: input.isAdmin } });
  return { success: true };
};

export const deleteUserAction = async (id: string) => {
  const db = acquirePrismaClient();
  await db.user.delete({ where: { id } });
  return { success: true };
};
