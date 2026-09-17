import { acquireDatabase } from "@/lib/database";
import { AppReview } from "@/entities";

export async function listAppReviews() {
  const db = await acquireDatabase();
  const repo = db.getRepository(AppReview);
  return repo.find({ order: { createdAt: "DESC" } });
}

export async function createAppReview(input: { userId?: string; userName?: string; email?: string; rating: number; text: string }) {
  const db = await acquireDatabase();
  const repo = db.getRepository(AppReview);
  await repo.insert({ id: crypto.randomUUID(), ...input });
}

export async function updateAppReviewStatus(id: string, isApproved: boolean) {
  const db = await acquireDatabase();
  const repo = db.getRepository(AppReview);
  return repo.update({ id }, { isApproved });
}

export async function deleteAppReview(id: string) {
  const db = await acquireDatabase();
  const repo = db.getRepository(AppReview);
  await repo.delete({ id });
  return { success: true };
}

export async function getAppReviewStats() {
  const db = await acquireDatabase();
  const repo = db.getRepository(AppReview);
  const [total, approved, pending, avg] = await Promise.all([
    repo.count(),
    repo.count({ where: { isApproved: true } }),
    repo.count({ where: { isApproved: false } }),
    repo.createQueryBuilder("appReview").select("AVG(appReview.rating)", "avg").getRawOne(),
  ]);
  return {
    total,
    approved,
    pending,
    averageRating: avg?.avg ?? 0,
  };
}

export async function getAllAppReviews() {
  return listAppReviews();
}

export async function getApprovedAppReviews() {
  const db = await acquireDatabase();
  const repo = db.getRepository(AppReview);
  return repo.find({ where: { isApproved: true }, order: { createdAt: "DESC" } });
}

export async function getPendingAppReviews() {
  const db = await acquireDatabase();
  const repo = db.getRepository(AppReview);
  return repo.find({ where: { isApproved: false }, order: { createdAt: "DESC" } });
}
