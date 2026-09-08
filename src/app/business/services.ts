import type { Contract } from "@/prisma/contract.d";
import type { PostgresClient } from "@internal/postgres/runtime";

export type BusinessWithIncludes = any;
export type SerializableBusinessWithIncludes = any;
export type BusinessListItem = any;

export async function getAllBusinesses(
  db?: PostgresClient<Contract>,
): Promise<any[]> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquirePrismaClient();

  return await resolvedDb.orm.Business
    .where({ isPublished: true })
    .include("images")
    .include("tags")
    .include("reviews")
    .orderBy((b) => b.createdAt.desc())
    .all();
}

export async function getBusinessById(
  id: string,
  db?: PostgresClient<Contract>,
): Promise<any | null> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquirePrismaClient();

  const requested = decodeURIComponent(id);
  const byId = await resolvedDb.orm.Business
    .where({ id: requested })
    .include("images")
    .include("tags")
    .include("menuItems")
    .include("foods", (f) => f.include("food"))
    .include("reviews", (r) => r.include("user").orderBy((rev) => rev.createdAt.desc()))
    .first();

  if (byId) return serializeBusiness(byId);

  const businesses = await resolvedDb.orm.Business
    .where({ isPublished: true })
    .include("images")
    .include("tags")
    .include("menuItems")
    .include("foods", (f) => f.include("food"))
    .include("reviews", (r) => r.include("user").orderBy((rev) => rev.createdAt.desc()))
    .all();

  const business = businesses.find((business: any) => business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === requested.toLowerCase());
  return business ? serializeBusiness(business) : null;
}

function serializeBusiness(business: any): any {
  return {
    ...business,
    menuItems: (business.menuItems || []).map((item: any) => ({
      ...item,
      price: Number(item.price),
    })),
  };
}

export async function getAverageRatingForBusiness(
  businessId: string,
  db?: PostgresClient<Contract>,
): Promise<number> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquirePrismaClient();

  const reviews = await resolvedDb.orm.Review
    .where({ businessId })
    .all();

  if (reviews.length === 0) return 0;

  const totalScore = reviews.reduce((sum: number, review: any) => {
    const avg = (review.foodQuality + review.service + review.ambiance + review.value) / 4;
    return sum + avg;
  }, 0);

  return Math.round((totalScore / reviews.length) * 10) / 10;
}
