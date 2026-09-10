"use server";

import z from "zod";
import { actionify } from "@/lib/action/server";
import { acquirePrismaClient } from "@/lib/infra";
import { getAllBusinesses, getBusinessById } from "@/logic/businesses";

const uuidSchema = z.string().uuid("Invalid UUID format");

export const getBusinessesAction = actionify(
  async ({}) => getAllBusinesses(),
  z.object({})
);

export const getBusinessByIdAction = actionify(
  async ({ id }: { id: string }) => getBusinessById(id),
  z.object({ id: uuidSchema })
);

const createReviewSchema = z.object({
  userId: uuidSchema,
  businessId: uuidSchema,
  text: z.string().min(10, "Review must be at least 10 characters"),
  foodQuality: z.number().min(1).max(5),
  service: z.number().min(1).max(5),
  ambiance: z.number().min(1).max(5),
  value: z.number().min(1).max(5),
});

export const createReviewAction = actionify(
  async (input: z.infer<typeof createReviewSchema>) => {
    const db = acquirePrismaClient();
    return await db.review.create({
      data: {
        id: crypto.randomUUID(),
        userId: input.userId,
        businessId: input.businessId,
        text: input.text,
        foodQuality: input.foodQuality,
        service: input.service,
        ambiance: input.ambiance,
        value: input.value,
        upvotes: 0,
      },
    });
  },
  createReviewSchema
);

const createBookmarkSchema = z.object({
  userId: uuidSchema,
  businessId: uuidSchema,
});

export const createBookmarkAction = actionify(
  async (input: z.infer<typeof createBookmarkSchema>) => {
    const db = acquirePrismaClient();
    return await db.bookmark.create({
      data: { id: crypto.randomUUID(), userId: input.userId, businessId: input.businessId },
    });
  },
  createBookmarkSchema
);

const deleteBookmarkSchema = z.object({
  userId: uuidSchema,
  businessId: uuidSchema,
});

export const deleteBookmarkAction = actionify(
  async (input: z.infer<typeof deleteBookmarkSchema>) => {
    const db = acquirePrismaClient();
    const existing = await db.bookmark.findFirst({ where: { userId: input.userId, businessId: input.businessId } });
    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
    }
  },
  deleteBookmarkSchema
);

const upvoteReviewSchema = z.object({
  reviewId: uuidSchema,
});

export const upvoteReviewAction = actionify(
  async ({ reviewId }: z.infer<typeof upvoteReviewSchema>) => {
    const db = acquirePrismaClient();
    const rev = await db.review.findFirst({ where: { id: reviewId } });
    if (rev) {
      await db.review.update({ where: { id: reviewId }, data: { upvotes: rev.upvotes + 1 } });
    }
    return { success: true };
  },
  upvoteReviewSchema
);
