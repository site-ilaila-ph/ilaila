import { acquirePrismaClient } from "@/lib/infra";
import { BusinessListItem } from "./types";

export async function getAllBusinesses(): Promise<BusinessListItem[]> {
  return await acquirePrismaClient().business.findMany({ where: { isPublished: true }, include: { images: true, tags: true, reviews: true, menuItems: true, foods: true } });
}

export async function getBusinessById(id: string): Promise<BusinessListItem | null> {
  return await acquirePrismaClient().business.findUnique({ where: { id }, include: { images: true, tags: true, reviews: true, menuItems: true, foods: true } });
}
