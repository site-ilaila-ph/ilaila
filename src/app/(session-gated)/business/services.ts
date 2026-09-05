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

type BusinessMenuItem = BusinessWithIncludes["menuItems"][number];

export type SerializableBusinessWithIncludes = Omit<BusinessWithIncludes, "menuItems"> & {
  menuItems: Array<Omit<BusinessMenuItem, "price"> & { price: number }>;
};

export type BusinessListItem = Prisma.BusinessGetPayload<{
  include: {
    images: true;
    tags: true;
    reviews: true;
  };
}>;

export async function getAllBusinesses(
  db?: Pick<PrismaClient, "business">,
): Promise<BusinessListItem[]> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquireDb();

  return resolvedDb.business.findMany({
    where: { isPublished: true },
    include: {
      images: true,
      tags: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBusinessById(
  id: string,
  db?: Pick<PrismaClient, "business">,
): Promise<SerializableBusinessWithIncludes | null> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquireDb();

  const requested = decodeURIComponent(id);
  const include = {
    images: true,
    tags: true,
    menuItems: true,
    foods: { include: { food: true } },
    reviews: { include: { user: true }, orderBy: { createdAt: "desc" as const } },
  };
  const byId = await resolvedDb.business.findUnique({
    where: { id: requested },
    include,
  });
  if (byId) return serializeBusiness(byId);

  const businesses = await resolvedDb.business.findMany({
    where: { isPublished: true },
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

  const business = businesses.find((business) => business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === requested.toLowerCase());
  return business ? serializeBusiness(business) : null;
}

function serializeBusiness(business: BusinessWithIncludes): SerializableBusinessWithIncludes {
  return {
    ...business,
    menuItems: business.menuItems.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  };
}

export async function getAverageRatingForBusiness(
  businessId: string,
  db?: Pick<PrismaClient, "review">,
): Promise<number> {
  const resolvedDb = db ?? (await import("@/lib/infra")).acquireDb();

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
