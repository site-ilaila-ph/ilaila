"use server";

import z from "zod";
import { toServerAction } from "@/lib/action/server";
import { acquireDb } from "@/lib/live";
import type { PrismaClient } from "@/generated/prisma/client";
import { getAllBusinesses, getBusinessById } from "@/app/(session-gated)/business/services";

const businessActionDependencies = () => ({
  db: acquireDb(),
});

export const getBusinessesAction = toServerAction({
  serviceFn: async (
    _params: Record<string, never>,
    deps: { db: Pick<PrismaClient, "business"> } = businessActionDependencies(),
  ) => getAllBusinesses(deps.db),
  schema: z.object({}),
  dependencies: businessActionDependencies,
});

export const getBusinessByIdAction = toServerAction({
  serviceFn: async (
    id: string,
    deps: { db: Pick<PrismaClient, "business"> } = businessActionDependencies(),
  ) => getBusinessById(id, deps.db),
  schema: z.string().min(1),
  dependencies: businessActionDependencies,
});

// Review actions
const createReviewSchema = z.object({
  userId: z.string(),
  businessId: z.string(),
  text: z.string().min(10),
  foodQuality: z.number().min(1).max(5),
  service: z.number().min(1).max(5),
  ambiance: z.number().min(1).max(5),
  value: z.number().min(1).max(5),
});

export const createReviewAction = toServerAction({
  serviceFn: async (
    input: z.infer<typeof createReviewSchema>,
  ) => {
    const db = acquireDb();
    return await db.review.upsert({
      where: { userId_businessId: { userId: input.userId, businessId: input.businessId } },
      create: {
        userId: input.userId,
        businessId: input.businessId,
        text: input.text,
        foodQuality: input.foodQuality,
        service: input.service,
        ambiance: input.ambiance,
        value: input.value,
      },
      update: {
        text: input.text,
        foodQuality: input.foodQuality,
        service: input.service,
        ambiance: input.ambiance,
        value: input.value,
      },
    });
  },
  schema: createReviewSchema,
});

// Bookmark actions
const createBookmarkSchema = z.object({
  userId: z.string(),
  businessId: z.string(),
});

export const createBookmarkAction = toServerAction({
  serviceFn: async (input: z.infer<typeof createBookmarkSchema>) => {
    const db = acquireDb();
    return await db.bookmark.upsert({
      where: { userId_businessId: { userId: input.userId, businessId: input.businessId } },
      create: { userId: input.userId, businessId: input.businessId },
      update: {},
    });
  },
  schema: createBookmarkSchema,
});

const deleteBookmarkSchema = z.object({
  userId: z.string(),
  businessId: z.string(),
});

export const deleteBookmarkAction = toServerAction({
  serviceFn: async (input: z.infer<typeof deleteBookmarkSchema>) => {
    const db = acquireDb();
    await db.bookmark.delete({
      where: { userId_businessId: { userId: input.userId, businessId: input.businessId } },
    });
  },
  schema: deleteBookmarkSchema,
});
