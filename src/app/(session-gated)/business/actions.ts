"use server";

import z from "zod";
import { toServerAction } from "@/lib/action/server";
import { acquirePrismaClient } from "@/lib/infra";
import type { Contract } from "@/prisma/contract.d";
import type { PostgresClient } from "@internal/postgres/runtime";
import { getAllBusinesses, getBusinessById } from "@/app/(session-gated)/business/services";
import { createSessionReader } from "@/lib/session/server";
import { acquireCacheManager, acquireNextJSCookieMap } from "@/lib/infra";

async function requireCurrentUserId() {
  const session = createSessionReader({ db: acquirePrismaClient(), cache: acquireCacheManager(), cookieMap: await acquireNextJSCookieMap() });
  const user = await session.getSessionUser();
  if (!user) throw new Error("Authentication required");
  return user.id;
}

const businessActionDependencies = () => ({
  db: acquirePrismaClient(),
});

export const getBusinessesAction = toServerAction({
  serviceFn: async (
    _params: Record<string, never>,
    deps: { db: PostgresClient<Contract> } = businessActionDependencies(),
  ) => getAllBusinesses(deps.db),
  schema: z.object({}),
  dependencies: businessActionDependencies,
});

export const getBusinessByIdAction = toServerAction({
  serviceFn: async (
    id: string,
    deps: { db: PostgresClient<Contract> } = businessActionDependencies(),
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
    const db = acquirePrismaClient();
    const userId = await requireCurrentUserId();
    if (userId !== input.userId) throw new Error("You can only review as the signed-in user");
    return await db.orm.Review.upsert({
      create: {
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
    const db = acquirePrismaClient();
    return await db.orm.Bookmark.upsert({
      create: { id: crypto.randomUUID(), userId: input.userId, businessId: input.businessId },
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
    const db = acquirePrismaClient();
    const existing = await db.orm.Bookmark.where({ userId: input.userId, businessId: input.businessId }).first();
    if (existing) {
      await db.orm.Bookmark.where({ id: existing.id }).delete();
    }
  },
  schema: deleteBookmarkSchema,
});

const upvoteReviewSchema = z.object({
  reviewId: z.string(),
});

export const upvoteReviewAction = toServerAction({
  serviceFn: async ({ reviewId }: z.infer<typeof upvoteReviewSchema>) => {
    const db = acquirePrismaClient();
    await requireCurrentUserId();
    const rev = await db.orm.Review.where({ id: reviewId }).first();
    if (rev) {
      await db.orm.Review.where({ id: reviewId }).update({ upvotes: rev.upvotes + 1 });
    }
    return { success: true };
  },
  schema: upvoteReviewSchema,
});
