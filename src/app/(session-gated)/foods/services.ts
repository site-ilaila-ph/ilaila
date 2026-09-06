import type { Contract } from "@/prisma/contract.d";
import type { PostgresClient } from "@internal/postgres/runtime";

export type FoodWithIncludes = any;
export type FoodListItem = any;

export async function getAllFood(
  db?: PostgresClient<Contract>,
): Promise<FoodListItem[]> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquirePrismaClient();

  return await resolvedDb.orm.Food
    .include("images")
    .include("tags")
    .orderBy((f) => f.name.asc())
    .all();
}

export async function getFoodById(
  id: string,
  db?: PostgresClient<Contract>,
): Promise<FoodWithIncludes | null> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquirePrismaClient();

  return await resolvedDb.orm.Food
    .where({ id })
    .include("images")
    .include("tags")
    .include("businesses", (b) => b.include("business", (biz) => biz.include("images").include("tags")))
    .first();
}

export async function getFoodByName(
  name: string,
  db?: PostgresClient<Contract>,
): Promise<FoodWithIncludes | null> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquirePrismaClient();

  return await resolvedDb.orm.Food
    .where((f) => f.name.ilike(`%${name}%`))
    .include("images")
    .include("tags")
    .include("businesses", (b) => b.include("business", (biz) => biz.include("images").include("tags")))
    .first();
}

export async function getTopRatedFoods(
  limit: number = 3,
  db?: PostgresClient<Contract>,
): Promise<(FoodListItem & { averageRating: number })[]> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquirePrismaClient();

  const foods = await resolvedDb.orm.Food
    .include("images")
    .include("tags")
    .include("businesses", (b) => b.include("business", (biz) => biz.include("reviews")))
    .all();

  const foodsWithRatings = foods
    .map((food: any) => {
      const allReviews = (food.businesses || []).flatMap((bf: any) => bf.business?.reviews || []);
      const averageRating =
        allReviews.length > 0
          ? allReviews.reduce((sum: number, review: any) => sum + review.foodQuality, 0) /
            allReviews.length
          : 0;

      return {
        ...food,
        averageRating,
      };
    })
    .filter((food: any) => food.averageRating > 0)
    .sort((a: any, b: any) => b.averageRating - a.averageRating)
    .slice(0, limit);

  return foodsWithRatings;
}
