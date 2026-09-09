import type { Prisma, PrismaClient } from '@/generated/prisma/client'

export type FoodWithIncludes = Prisma.FoodGetPayload<{
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
  db?: PrismaClient,
): Promise<FoodListItem[]> {
  const resolvedDb = db ?? (await import('@/lib/infra')).acquirePrismaClient()

  return resolvedDb.food.findMany({
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
  db?: PrismaClient,
): Promise<FoodWithIncludes | null> {
  const resolvedDb = db ?? (await import('@/lib/infra')).acquirePrismaClient()

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
  })
}

export async function getFoodByName(
  name: string,
  db?: PrismaClient,
): Promise<FoodWithIncludes | null> {
  const resolvedDb = db ?? (await import('@/lib/infra')).acquirePrismaClient()

  return resolvedDb.food.findFirst({
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
  db?: PrismaClient,
): Promise<(FoodListItem & { averageRating: number })[]> {
  const resolvedDb = db ?? (await import('@/lib/infra')).acquirePrismaClient()

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
