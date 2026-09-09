"use server";

import z from "zod";
import { acquirePrismaClient } from "@/lib/infra";
import { getAllBusinesses, getBusinessById } from "@/app/business/services";
import { cookies } from "next/headers";
import { createSessionReader } from "@/lib/session/server";
import { acquireCacheManager } from "@/lib/infra";

async function requireCurrentUserId() {
  const cookieStore = await cookies();
  const session = createSessionReader({ db: acquirePrismaClient(), cache: acquireCacheManager(), cookieMap: cookieStore });
  const user = await session.getSessionUser();
  if (!user) throw new Error("Authentication required");
  return user.id;
}

export const getBusinessesAction = async () => {
  const db = acquirePrismaClient();
  return getAllBusinesses(db);
};

export const getBusinessByIdAction = async (id: string) => {
  const db = acquirePrismaClient();
  return getBusinessById(id, db);
};

const createReviewSchema = z.object({
  userId: z.string(),
  businessId: z.string(),
  text: z.string().min(10),
  foodQuality: z.number().min(1).max(5),
  service: z.number().min(1).max(5),
  ambiance: z.number().min(1).max(5),
  value: z.number().min(1).max(5),
});

export const createReviewAction = async (input: z.infer<typeof createReviewSchema>) => {
  const db = acquirePrismaClient();
  const userId = await requireCurrentUserId();
  if (userId !== input.userId) throw new Error("You can only review as the signed-in user");
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
};

const createBookmarkSchema = z.object({
  userId: z.string(),
  businessId: z.string(),
});

export const createBookmarkAction = async (input: z.infer<typeof createBookmarkSchema>) => {
  const db = acquirePrismaClient();
  return await db.bookmark.create({
    data: { id: crypto.randomUUID(), userId: input.userId, businessId: input.businessId },
  });
};

const deleteBookmarkSchema = z.object({
  userId: z.string(),
  businessId: z.string(),
});

export const deleteBookmarkAction = async (input: z.infer<typeof deleteBookmarkSchema>) => {
  const db = acquirePrismaClient();
  const existing = await db.bookmark.findFirst({ where: { userId: input.userId, businessId: input.businessId } });
  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } });
  }
};

const upvoteReviewSchema = z.object({
  reviewId: z.string(),
});

export const upvoteReviewAction = async ({ reviewId }: z.infer<typeof upvoteReviewSchema>) => {
  const db = acquirePrismaClient();
  await requireCurrentUserId();
  const rev = await db.review.findFirst({ where: { id: reviewId } });
  if (rev) {
    await db.review.update({ where: { id: reviewId }, data: { upvotes: rev.upvotes + 1 } });
  }
  return { success: true };
};
