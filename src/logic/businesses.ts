import { Prisma } from "@/generated/prisma/client";
import { acquirePrismaClient } from "@/lib/infra";
import { fail, success } from "@/lib/csap";
export type BusinessListItem = Prisma.BusinessGetPayload<{
  include: {
    reviews: true,
    tags: true,
    images: true,
    foods: true
  }
}>;

export async function getAllBusinesses() {
  const db = acquirePrismaClient();
  return success(await db.business.findMany({ where: { isPublished: true }, include: { images: true, tags: true, reviews: true, menuItems: true, foods: true } }));
}

export async function getBusinessById(id: string) {
  const db = acquirePrismaClient();
  const data = await db.business.findUnique({ where: { id }, include: { images: true, tags: true, reviews: true, menuItems: true, foods: true } });
  return data ? success(data) : fail("NOT_FOUND", "Business not found");
}
