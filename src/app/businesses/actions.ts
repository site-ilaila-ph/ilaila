"use server";

import z from "zod";
import { actionify } from "@/lib/action/server";
import { acquirePrismaClient } from "@/lib/infra";
import { getAllBusinesses, getBusinessById } from "./services";

const uuidSchema = z.string().uuid("Invalid UUID format");

export async function getBusinessesAction(input: Record<string, never> = {}) {
  const wrapped = actionify(async () => getAllBusinesses(), z.object({}));
  return await wrapped(input);
}

export async function getBusinessByIdAction(input: { id: string }) {
  const wrapped = actionify(async ({ id }: { id: string }) => getBusinessById(id), z.object({ id: uuidSchema }));
  return await wrapped(input);
}

const createReviewSchema = z.object({
  userId: uuidSchema,
  businessId: uuidSchema,
  text: z.string().min(10, "Review must be at least 10 characters"),
  foodQuality: z.number().min(1).max(5),
  service: z.number().min(1).max(5),
  ambiance: z.number().min(1).max(5),
  value: z.number().min(1).max(5),
});

export async function createReviewAction(input: z.infer<typeof createReviewSchema>) {
  const wrapped = actionify(async (payload: z.infer<typeof createReviewSchema>) => {
    const db = acquirePrismaClient();
    return await db.review.create({
      data: {
        id: crypto.randomUUID(),
        userId: payload.userId,
        businessId: payload.businessId,
        text: payload.text,
        foodQuality: payload.foodQuality,
        service: payload.service,
        ambiance: payload.ambiance,
        value: payload.value,
        upvotes: 0,
      },
    });
  }, createReviewSchema);

  return await wrapped(input);
}

const createBookmarkSchema = z.object({
  userId: uuidSchema,
  businessId: uuidSchema,
});

export async function createBookmarkAction(input: z.infer<typeof createBookmarkSchema>) {
  const wrapped = actionify(async (payload: z.infer<typeof createBookmarkSchema>) => {
    const db = acquirePrismaClient();
    return await db.bookmark.create({
      data: { id: crypto.randomUUID(), userId: payload.userId, businessId: payload.businessId },
    });
  }, createBookmarkSchema);

  return await wrapped(input);
}

const deleteBookmarkSchema = z.object({
  userId: uuidSchema,
  businessId: uuidSchema,
});

export async function deleteBookmarkAction(input: z.infer<typeof deleteBookmarkSchema>) {
  const wrapped = actionify(async (payload: z.infer<typeof deleteBookmarkSchema>) => {
    const db = acquirePrismaClient();
    const existing = await db.bookmark.findFirst({ where: { userId: payload.userId, businessId: payload.businessId } });
    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
    }
  }, deleteBookmarkSchema);

  return await wrapped(input);
}

const upvoteReviewSchema = z.object({
  reviewId: uuidSchema,
});

export async function upvoteReviewAction(input: z.infer<typeof upvoteReviewSchema>) {
  const wrapped = actionify(async ({ reviewId }: z.infer<typeof upvoteReviewSchema>) => {
    const db = acquirePrismaClient();
    const rev = await db.review.findFirst({ where: { id: reviewId } });
    if (rev) {
      await db.review.update({ where: { id: reviewId }, data: { upvotes: rev.upvotes + 1 } });
    }
    return { success: true };
  }, upvoteReviewSchema);

  return await wrapped(input);
}
