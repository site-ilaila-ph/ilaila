import type { Prisma } from "@/generated/prisma/client";
import { acquirePrismaClient } from "@/lib/infra";
import { fail, success } from "@/lib/csap";
export type FoodWithRelations = Prisma.FoodGetPayload<{
  include: {
    images: true
    tags: true
    businesses: {
      include: {
        business: {
          include: {
            images: true
            tags: true
          }
        }
      }
    }
  }
}>

export type FoodListItem = Prisma.FoodGetPayload<{
  include: {
    images: true
    tags: true
  }
}>

export async function getAllFood() {
  const db = acquirePrismaClient();
  return success(await db.food.findMany({ include: { images: true, tags: true }, orderBy: { name: "asc" } }));
}

export async function getFoodById(id: string) {
  const db = acquirePrismaClient();
  const data = await db.food.findUnique({ where: { id }, include: { images: true, tags: true, businesses: { include: { business: { include: { images: true, tags: true } } } } } });
  return data ? success(data) : fail("NOT_FOUND", "Food not found");
}

export async function getFoodByName(name: string) {
  const db = acquirePrismaClient();
  const data = await db.food.findFirst({ where: { name: { contains: name, mode: "insensitive" } }, include: { images: true, tags: true, businesses: { include: { business: { include: { images: true, tags: true } } } } } });
  return data ? success(data) : fail("NOT_FOUND", "Food not found");
}

export async function getTopRatedFoods(limit: number) {

  const db = acquirePrismaClient();
  const foods = await db.food.findMany({ include: { images: true, tags: true, businesses: { include: { business: { include: { reviews: true } } } } } });
  const withRatings = foods.map((f) => {
    const reviews = f.businesses.flatMap((b) => b.business?.reviews ?? []);
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.foodQuality, 0) / reviews.length : 0;
    return { ...f, averageRating: avg };
  }).filter((f) => f.averageRating > 0).sort((a, b) => b.averageRating - a.averageRating).slice(0, limit);
  return success(withRatings);
}
