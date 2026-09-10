"use server";

import { acquirePrismaClient } from "@/lib/infra";
import z from "zod";
import { AppReview } from "@/generated/prisma/client";

export async function getAllAppReviews({}): Promise<AppReview[]> {
  const db = acquirePrismaClient();

  return await db.appReview.findMany({
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getApprovedAppReviews({}): Promise<AppReview[]> {
  const db = acquirePrismaClient();
  return await db.appReview.findMany({
    where: { isApproved: true },
    include: { user: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingAppReviews({}): Promise<AppReview[]> {
  const db = acquirePrismaClient();
  return await db.appReview.findMany({
    where: { isApproved: false },
    include: { user: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAppReviewStats({}) {
  const db = acquirePrismaClient();
  const [total, approved, pending, avgRatingResult] = await Promise.all([
    db.appReview.count(),
    db.appReview.count({ where: { isApproved: true } }),
    db.appReview.count({ where: { isApproved: false } }),
    db.appReview.aggregate({ _avg: { rating: true } }),
  ]);
  return {
    total,
    approved,
    pending,
    averageRating: avgRatingResult._avg.rating || 0,
  };
}

const createAppReviewSchema = z.object({
  userId: z.string().optional(),
  userName: z.string().optional(),
  email: z.string().email().optional(),
  rating: z.number().min(1).max(5),
  text: z.string().min(10).max(1000),
});

export const createAppReviewAction = async (
  input: z.infer<typeof createAppReviewSchema>,
) => {
  const db = acquirePrismaClient();
  return await db.appReview.create({
    data: { ...input, id: crypto.randomUUID() },
  });
};

const updateAppReviewStatusSchema = z.object({
  id: z.string(),
  isApproved: z.boolean(),
});

export const updateAppReviewStatusAction = async (
  input: z.infer<typeof updateAppReviewStatusSchema>,
) => {
  const db = acquirePrismaClient();
  await db.appReview.update({
    where: { id: input.id },
    data: { isApproved: input.isApproved },
  });
  return { success: true };
};

export const deleteAppReviewAction = async (id: string) => {
  const db = acquirePrismaClient();
  await db.appReview.delete({ where: { id } });
  return { success: true };
};
