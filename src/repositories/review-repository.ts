import { acquireDatabase } from "@/lib/database";
import { Review } from "@/entities";

export async function listAllReviews() {
  const db = await acquireDatabase();

  const repo = db.getRepository(Review);

  return repo.find({
    relations: {
      user: true,
      business: true,
    },
    order: {
      createdAt: "DESC",
    },
  });
}

export async function listReviewsForBusiness(id: string) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Review);
  return repo.createQueryBuilder().where("businessId = :id", { id }).orderBy("createdAt", "DESC").getMany();
}

export async function createReview(input: {
  businessId: string;
  userId: string;
  text: string;
  foodQuality: number;
  service: number;
  ambiance: number;
  value: number;
  images?: Array<Record<string, unknown>>;
}) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Review);
  return repo.create({
    id: crypto.randomUUID(),
    businessId: input.businessId,
    userId: input.userId,
    text: input.text,
    foodQuality: input.foodQuality,
    service: input.service,
    ambiance: input.ambiance,
    value: input.value,
  });
}

export async function updateReview(id: string, input: Partial<{ text: string; foodQuality: number; service: number; ambiance: number; value: number }>) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Review);
  return repo.update({ id }, input);
}

export async function deleteReview(id: string) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Review);
  await repo.delete({ id });
  return { success: true };
}

export async function deleteReviewById(id: string) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Review);
  await repo.delete({ id });
  return { success: true };
}
