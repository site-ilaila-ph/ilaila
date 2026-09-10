import { Prisma } from "@/generated/prisma/client";

export type BusinessListItem = Prisma.BusinessGetPayload<{
  include: {
    reviews: true,
    tags: true,
    images: true,
    menuItems: {
      include: {
        
      }
    },
    foods: true
  }
}>;