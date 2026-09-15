import { acquirePrismaClient } from "@/lib/infra";

export async function listAppReviews() {
  const db = acquirePrismaClient();
  return db.appReview.findMany({
    include: { user: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAppReview(input: { userId?: string; userName?: string; email?: string; rating: number; text: string }) {
  const db = acquirePrismaClient();
  await db.appReview.create({
    data: { id: crypto.randomUUID(), ...input },
  });
}

export async function updateAppReviewStatus(id: string, isApproved: boolean) {
  const db = acquirePrismaClient();
  return db.appReview.update({
    where: { id },
    data: { isApproved },
  });
}

export async function deleteAppReview(id: string) {
  const db = acquirePrismaClient();
  return db.appReview.delete({
    where: { id },
  });
}

export async function getAppReviewStats() {
  const db = acquirePrismaClient();
  const [total, approved, pending, avg] = await Promise.all([
    db.appReview.count(),
    db.appReview.count({ where: { isApproved: true } }),
    db.appReview.count({ where: { isApproved: false } }),
    db.appReview.aggregate({ _avg: { rating: true } }),
  ]);
  return {
    total,
    approved,
    pending,
    averageRating: avg._avg.rating ?? 0,
  };
}

export async function getAllAppReviews() {
  return listAppReviews();
}

export async function getApprovedAppReviews() {
  const db = acquirePrismaClient();
  return db.appReview.findMany({
    where: { isApproved: true },
    include: { user: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingAppReviews() {
  const db = acquirePrismaClient();
  return db.appReview.findMany({
    where: { isApproved: false },
    include: { user: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
}
