import type { PrismaClient, Prisma } from "@/generated/prisma/client";

export type BusinessWithIncludes = Prisma.BusinessGetPayload<{
  include: {
    images: true;
    tags: true;
    menuItems: true;
    foods: {
      include: {
        food: true;
      };
    };
    reviews: {
      include: {
        user: true;
      };
    };
  };
}>;

export type BusinessListItem = Prisma.BusinessGetPayload<{
  include: {
    images: true;
    tags: true;
  };
}>;

export async function getAllBusinesses(
  db?: Pick<PrismaClient, "business">,
): Promise<BusinessListItem[]> {
  const resolvedDb = db ?? (await import("@/lib/live")).acquireDb();

  return resolvedDb.business.findMany({
    where: { isPublished: true },
    include: {
      images: true,
      tags: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBusinessById(
  id: string,
  db?: Pick<PrismaClient, "business">,
): Promise<BusinessWithIncludes | null> {
  const resolvedDb = db ?? (await import("@/lib/live")).acquireDb();

  return resolvedDb.business.findUnique({
    where: { id },
    include: {
      images: true,
      tags: true,
      menuItems: true,
      foods: {
        include: {
          food: true,
        },
      },
      reviews: {
        include: {
          user: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getAverageRatingForBusiness(
  businessId: string,
  db?: Pick<PrismaClient, "review">,
): Promise<number> {
  const resolvedDb = db ?? (await import("@/lib/live")).acquireDb();

  const reviews = await resolvedDb.review.findMany({
    where: { businessId },
  });

  if (reviews.length === 0) return 0;

  const totalScore = reviews.reduce((sum, review) => {
    const avg = (review.foodQuality + review.service + review.ambiance + review.value) / 4;
    return sum + avg;
  }, 0);

  return Math.round((totalScore / reviews.length) * 10) / 10;
}
