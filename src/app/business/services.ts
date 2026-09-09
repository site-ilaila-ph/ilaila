import { acquirePrismaClient } from "@/lib/infra";

export async function getAllBusinesses(db?: any): Promise<any[]> {
  const resolvedDb = db ?? acquirePrismaClient();
  return await resolvedDb.business.findMany({ where: { isPublished: true }, include: { images: true, tags: true, reviews: true } });
}

export async function getBusinessById(id: string, db?: any): Promise<any | null> {
  const resolvedDb = db ?? acquirePrismaClient();
  const requested = decodeURIComponent(id);
  const byId = await resolvedDb.business.findUnique({ where: { id: requested }, include: { images: true, tags: true, reviews: true } });
  if (byId) return byId;
  const businesses = await resolvedDb.business.findMany({ where: { isPublished: true }, include: { images: true, tags: true, reviews: true } });
  const business = businesses.find((b: any) => b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === requested.toLowerCase());
  return business || null;
}
