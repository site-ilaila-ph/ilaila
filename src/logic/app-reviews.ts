"use server";

import { acquirePrismaClient } from "@/lib/infra";
import { success } from "@/lib/csap";
import z from "zod";

export async function getAllAppReviews() {
  return success(
    await acquirePrismaClient().appReview.findMany({
      include: { user: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    }),
  );
}

export async function getApprovedAppReviews() {
  return success(
    await acquirePrismaClient().appReview.findMany({
      where: { isApproved: true },
      include: { user: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    }),
  );
}

export async function getPendingAppReviews() {
  return success(
    await acquirePrismaClient().appReview.findMany({
      where: { isApproved: false },
      include: { user: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    }),
  );
}

export async function getAppReviewStats() {
  const [total, approved, pending, avgRatingResult] = await Promise.all([
    acquirePrismaClient().appReview.count(),
    acquirePrismaClient().appReview.count({ where: { isApproved: true } }),
    acquirePrismaClient().appReview.count({ where: { isApproved: false } }),
    acquirePrismaClient().appReview.aggregate({ _avg: { rating: true } }),
  ]);
  return success({
    total,
    approved,
    pending,
    averageRating: avgRatingResult._avg.rating || 0,
  });
}

export const createAppReviewAction = async (userId: string, email: string, rating: number, text: string) => {
  return success(
    await acquirePrismaClient().appReview.create({
      data: { userId, email, rating, text },
    }),
  );
};

export const updateAppReviewStatusAction = async (
  id: string,
  isApproved: boolean
) => {
  await acquirePrismaClient().appReview.update({
    where: { id },
    data: { isApproved },
  });
  return success({ updated: true });
};

export const deleteAppReviewAction = async (id: string) => {
  await acquirePrismaClient().appReview.delete({ where: { id } });
  return success({ deleted: true });
};
