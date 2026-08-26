import type { PrismaClient, Prisma } from "@/generated/prisma/client";

export type FoodWithIncludes = Prisma.FoodGetPayload<{
  include: {
    images: true;
    tags: true;
    businesses: {
      include: {
        business: true;
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
  const resolvedDb = db ?? (await import("@/lib/server/db")).acquireDb();

  return resolvedDb.food.findMany({
    include: {
      images: true,
      tags: true,
    },
  });
}

export async function getFoodById(
  id: string,
  db?: Pick<PrismaClient, "food">,
): Promise<FoodWithIncludes | null> {
  const resolvedDb = db ?? (await import("@/lib/server/db")).acquireDb();

  return resolvedDb.food.findUnique({
    where: { id },
    include: {
      images: true,
      tags: true,
      businesses: {
        include: {
          business: true,
        },
      },
    },
  });
}
