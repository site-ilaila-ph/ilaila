import type { PrismaClient, Prisma } from "@/generated/prisma/client";

export type FoodWithIncludes = Prisma.FoodGetPayload<{
  include: {
    images: true;
    tags: true;
    businesses: {
      include: {
        business: {
          include: {
            images: true;
            tags: true;
          };
        };
      };
    };
  };
}>;

export type FoodListItem = Prisma.FoodGetPayload<{
  include: {
    images: true;
    tags: true;
  };
}>;

export async function getAllFood(
  db?: Pick<PrismaClient, "food">,
): Promise<FoodListItem[]> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquireDb();

  return resolvedDb.food.findMany({
    include: {
      images: true,
      tags: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getFoodById(
  id: string,
  db?: Pick<PrismaClient, "food">,
): Promise<FoodWithIncludes | null> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquireDb();

  return resolvedDb.food.findUnique({
    where: { id },
    include: {
      images: true,
      tags: true,
      businesses: {
        include: {
          business: {
            include: {
              images: true,
              tags: true,
            },
          },
        },
      },
    },
  });
}

export async function getFoodByName(
  name: string,
  db?: Pick<PrismaClient, "food">,
): Promise<FoodWithIncludes | null> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquireDb();

  return resolvedDb.food.findFirst({
    where: {
      name: {
        contains: name,
        mode: "insensitive",
      },
    },
    include: {
      images: true,
      tags: true,
      businesses: {
        include: {
          business: {
            include: {
              images: true,
              tags: true,
            },
          },
        },
      },
    },
  });
}

export async function getTopRatedFoods(
  limit: number = 3,
  db?: Pick<PrismaClient, "food" | "businessFood" | "review">,
): Promise<(FoodListItem & { averageRating: number })[]> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquireDb();

  // Get all foods with their associated businesses
  const foods = await resolvedDb.food.findMany({
    include: {
      images: true,
      tags: true,
      businesses: {
        include: {
          business: {
            include: {
              reviews: true,
            },
          },
        },
      },
    },
  });

  // Calculate average rating for each food based on foodQuality ratings
  const foodsWithRatings = foods
    .map((food) => {
      const allReviews = food.businesses.flatMap((bf) => bf.business.reviews);
      const averageRating =
        allReviews.length > 0
          ? allReviews.reduce((sum, review) => sum + review.foodQuality, 0) /
            allReviews.length
          : 0;

      return {
        ...food,
        averageRating,
      };
    })
    .filter((food) => food.averageRating > 0) // Only include foods with reviews
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);

  return foodsWithRatings;
}
