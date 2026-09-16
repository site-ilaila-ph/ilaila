import { acquirePrismaClient } from "@/lib/infra";

export async function listAllReviews() {
  const db = acquirePrismaClient();
  return db.businessReview.findMany({
    include: {
      user: { include: { authUser: true } },
      business: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listReviewsForBusiness(businessId: string) {
  const db = acquirePrismaClient();
  return db.businessReview.findMany({
    where: { businessId },
    include: {
      user: { include: { authUser: true } },
      business: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
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
  const db = acquirePrismaClient();
  return db.businessReview.create({
    data: {
      id: crypto.randomUUID(),
      businessId: input.businessId,
      userId: input.userId,
      text: input.text,
      foodQuality: input.foodQuality,
      service: input.service,
      ambiance: input.ambiance,
      value: input.value,
    },
  });
}

export async function updateReview(id: string, input: Partial<{ text: string; foodQuality: number; service: number; ambiance: number; value: number }>) {
  const db = acquirePrismaClient();
  return db.businessReview.update({ where: { id }, data: input });
}

export async function deleteReview(id: string) {
  const db = acquirePrismaClient();
  await db.businessReview.delete({ where: { id } });
  return { success: true };
}

export async function deleteReviewById(id: string) {
  const db = acquirePrismaClient();
  await db.businessReview.delete({ where: { id } });
  return { success: true };
}
