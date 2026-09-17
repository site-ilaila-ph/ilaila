

export type FoodWithRelations = FoodGetPayload<{
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

export type FoodListItem = FoodGetPayload<{
  include: {
    images: true;
    tags: true;
  };
}>;

export type FoodDetail = FoodWithRelations;
export type FoodGetPayload<T> = any;
