import type { Prisma } from '@/generated/prisma/client'
import { acquirePrismaClient } from '@/lib/infra'

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

export async function getAllFood(
): Promise<FoodListItem[]> {
  const db = acquirePrismaClient();

  return db.food.findMany({
    include: {
      images: true,
      tags: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getFoodById(
  id: string,
): Promise<FoodWithRelations | null> {
  const db = acquirePrismaClient();

  return db.food.findUnique({
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
  })
}

export async function getFoodByName(
  name: string,
): Promise<FoodWithRelations | null> {
  const db = acquirePrismaClient();

  return db.food.findFirst({
    where: {
      name: {
        contains: name,
        mode: 'insensitive',
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
  })
}

export async function getTopRatedFoods(
  limit: number = 3,
): Promise<(FoodListItem & { averageRating: number })[]> {
  const db = acquirePrismaClient();

  const foods = await db.food.findMany({
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
  })

  const foodsWithRatings = foods
    .map((food) => {
      const allReviews = food.businesses.flatMap(
        (bf) => bf.business?.reviews ?? [],
      )

      const averageRating =
        allReviews.length > 0
          ? allReviews.reduce(
              (sum, review) => sum + review.foodQuality,
              0,
            ) / allReviews.length
          : 0

      return {
        ...food,
        averageRating,
      }
    })
    .filter((food) => food.averageRating > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit)

  return foodsWithRatings
}
