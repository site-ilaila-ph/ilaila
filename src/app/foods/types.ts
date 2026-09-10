import type { Prisma } from "@/generated/prisma/client";

export type FoodWithRelations = Prisma.FoodGetPayload<{
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
