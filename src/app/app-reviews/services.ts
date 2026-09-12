import { AppReview } from "@/generated/prisma/client";
import { acquirePrismaClient } from "@/lib/infra";

export async function createAppReview(input: {
  userId?: string;
  userName?: string;
  email?: string;
  rating: number;
  text: string;
}) {
  const db = acquirePrismaClient();
  return await db.appReview.create({
    data: { ...input, id: crypto.randomUUID() },
  });
}

export async function getAllAppReviews(): Promise<AppReview[]> {
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

export async function getApprovedAppReviews(): Promise<AppReview[]> {
  const db = acquirePrismaClient();
  return await db.appReview.findMany({
    where: { isApproved: true },
    include: { user: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingAppReviews(): Promise<AppReview[]> {
  const db = acquirePrismaClient();
  return await db.appReview.findMany({
    where: { isApproved: false },
    include: { user: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateAppReviewStatus(id: string, isApproved: boolean) {
  const db = acquirePrismaClient();
  await db.appReview.update({
    where: { id },
    data: { isApproved },
  });
  return { success: true };
}

export async function deleteAppReview(id: string) {
  const db = acquirePrismaClient();
  await db.appReview.delete({ where: { id } });
  return { success: true };
}

export async function getAppReviewStats() {
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
