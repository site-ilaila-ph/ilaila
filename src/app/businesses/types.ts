import type { Prisma } from "@/generated/prisma/client";

export type BusinessListItem = Prisma.BusinessGetPayload<{
  include: {
    reviews: { include: { user: { include: { authUser: true } } } };
    tags: true;
    images: true;
    foods: { include: { food: { include: { images: true; tags: true } } } };
    menuItems: true;
  };
}>;
