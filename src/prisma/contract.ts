import {
  defineContract,
  rel,
} from "@prisma/orm-postgres/contract-builder";

export const contract = defineContract({}, ({ field, model }) => {
  const User = model("User", {
    fields: {
      createdAt: field.temporal.createdAt(),
      updatedAt: field.temporal.updatedAt(),
      id: field.text().id(),
      userName: field.text().optional(),
      email: field.text().unique(),
      passwordHash: field.text(),
      isAdmin: field.boolean().default(false),
    },
  });

  const Session = model("Session", {
    fields: {
      id: field.text().id(),
      userId: field.text(),
      expiresAt: field.dateTime(),
      createdAt: field.temporal.createdAt(),
      updatedAt: field.temporal.updatedAt(),
    },
  });

  const Food = model("Food", {
    fields: {
      id: field.text().id(),
      name: field.text(),
      description: field.text(),
      history: field.text(),
      preparation: field.text(),
      recipe: field.text(),
      culturalSignificance: field.text(),
      isHeritage: field.boolean(),
    },
  });

  const FoodTag = model("FoodTag", {
    fields: {
      id: field.text().id(),
      value: field.text(),
      foodId: field.text(),
    },
  });

  const FoodImage = model("FoodImage", {
    fields: {
      id: field.text().id(),
      foodId: field.text(),
      description: field.text(),
      url: field.text().optional(),
    },
  });

  const Business = model("Business", {
    fields: {
      id: field.text().id(),
      name: field.text(),
      description: field.text(),
      history: field.text().optional(),
      isPublished: field.boolean().default(true),
      createdById: field.text(),
      address: field.text(),
      latitude: field.float(),
      longitude: field.float(),
      hours: field.text(),
      createdAt: field.temporal.createdAt(),
      updatedAt: field.temporal.updatedAt(),
    },
  });

  const BusinessImage = model("BusinessImage", {
    fields: {
      id: field.text().id(),
      businessId: field.text(),
      description: field.text(),
      url: field.text().optional(),
    },
  });

  const BusinessTag = model("BusinessTag", {
    fields: {
      id: field.text().id(),
      value: field.text(),
      businessId: field.text(),
    },
  });

  const MenuItem = model("MenuItem", {
    fields: {
      id: field.text().id(),
      businessId: field.text(),
      name: field.text(),
      description: field.text().optional(),
      price: field.decimal(),
      isAvailable: field.boolean().default(true),
      dietaryTags: field.text().many(),
    },
  });

  const BusinessFood = model("BusinessFood", {
    fields: {
      id: field.text().id(),
      businessId: field.text(),
      foodId: field.text(),
    },
  });

  const Review = model("Review", {
    fields: {
      id: field.text().id(),
      userId: field.text(),
      businessId: field.text(),
      text: field.text(),
      foodQuality: field.int(),
      service: field.int(),
      ambiance: field.int(),
      value: field.int(),
      upvotes: field.int().default(0),
      createdAt: field.temporal.createdAt(),
      updatedAt: field.temporal.updatedAt(),
    },
  });

  const Bookmark = model("Bookmark", {
    fields: {
      id: field.text().id(),
      userId: field.text(),
      businessId: field.text(),
      createdAt: field.temporal.createdAt(),
    },
  });

  const AppReview = model("AppReview", {
    fields: {
      id: field.text().id(),
      userId: field.text().optional(),
      userName: field.text().optional(),
      email: field.text().optional(),
      rating: field.int().default(5),
      text: field.text(),
      isApproved: field.boolean().default(false),
      createdAt: field.temporal.createdAt(),
      updatedAt: field.temporal.updatedAt(),
    },
  });

  return {
    models: {
      User: User.relations({
        appReviews: rel.hasMany(AppReview, { by: "userId" }),
        bookmarks: rel.hasMany(Bookmark, { by: "userId" }),
        businessesPosted: rel.hasMany(Business, { by: "createdById" }),
        reviews: rel.hasMany(Review, { by: "userId" }),
        sessions: rel.hasMany(Session, { by: "userId" }),
      }).sql({ table: "User" }),

      Session: Session.relations({
        user: rel.belongsTo(User, {
          from: "userId",
          to: "id",
        }),
      }).sql(({ cols, constraints }) => ({
        table: "Session",
        foreignKeys: [
          constraints.foreignKey(cols.userId, User.refs.id),
        ],
        indexes: [
          constraints.index([cols.userId]),
        ],
      })),

      Food: Food.relations({
        businesses: rel.hasMany(BusinessFood, { by: "foodId" }),
        images: rel.hasMany(FoodImage, { by: "foodId" }),
        tags: rel.hasMany(FoodTag, { by: "foodId" }),
      }).sql({ table: "Food" }),

      FoodTag: FoodTag.relations({
        food: rel.belongsTo(Food, {
          from: "foodId",
          to: "id",
        }),
      }).sql(({ cols, constraints }) => ({
        table: "FoodTag",
        foreignKeys: [
          constraints.foreignKey(cols.foodId, Food.refs.id),
        ],
      })),

      FoodImage: FoodImage.relations({
        food: rel.belongsTo(Food, {
          from: "foodId",
          to: "id",
        }),
      }).sql(({ cols, constraints }) => ({
        table: "FoodImage",
        foreignKeys: [
          constraints.foreignKey(cols.foodId, Food.refs.id),
        ],
      })),

      Business: Business.relations({
        bookmarks: rel.hasMany(Bookmark, { by: "businessId" }),
        createdBy: rel.belongsTo(User, {
          from: "createdById",
          to: "id",
        }),
        foods: rel.hasMany(BusinessFood, { by: "businessId" }),
        images: rel.hasMany(BusinessImage, { by: "businessId" }),
        tags: rel.hasMany(BusinessTag, { by: "businessId" }),
        menuItems: rel.hasMany(MenuItem, { by: "businessId" }),
        reviews: rel.hasMany(Review, { by: "businessId" }),
      }).sql(({ cols, constraints }) => ({
        table: "Business",
        foreignKeys: [
          constraints.foreignKey(cols.createdById, User.refs.id),
        ],
      })),

      BusinessImage: BusinessImage.relations({
        business: rel.belongsTo(Business, {
          from: "businessId",
          to: "id",
        }),
      }).sql(({ cols, constraints }) => ({
        table: "BusinessImage",
        foreignKeys: [
          constraints.foreignKey(cols.businessId, Business.refs.id),
        ],
      })),

      BusinessTag: BusinessTag.relations({
        business: rel.belongsTo(Business, {
          from: "businessId",
          to: "id",
        }),
      }).sql(({ cols, constraints }) => ({
        table: "BusinessTag",
        foreignKeys: [
          constraints.foreignKey(cols.businessId, Business.refs.id),
        ],
      })),

      MenuItem: MenuItem.relations({
        business: rel.belongsTo(Business, {
          from: "businessId",
          to: "id",
        }),
      }).sql(({ cols, constraints }) => ({
        table: "MenuItem",
        foreignKeys: [
          constraints.foreignKey(cols.businessId, Business.refs.id),
        ],
      })),

      BusinessFood: BusinessFood.relations({
        business: rel.belongsTo(Business, {
          from: "businessId",
          to: "id",
        }),
        food: rel.belongsTo(Food, {
          from: "foodId",
          to: "id",
        }),
      }).sql(({ cols, constraints }) => ({
        table: "BusinessFood",
        foreignKeys: [
          constraints.foreignKey(cols.businessId, Business.refs.id),
          constraints.foreignKey(cols.foodId, Food.refs.id),
        ],
        unique: [
          [cols.businessId, cols.foodId],
        ],
      })),

      Review: Review.relations({
        business: rel.belongsTo(Business, {
          from: "businessId",
          to: "id",
        }),
        user: rel.belongsTo(User, {
          from: "userId",
          to: "id",
        }),
      }).sql(({ cols, constraints }) => ({
        table: "Review",
        foreignKeys: [
          constraints.foreignKey(cols.businessId, Business.refs.id),
          constraints.foreignKey(cols.userId, User.refs.id),
        ],
        unique: [
          [cols.userId, cols.businessId],
        ],
      })),

      Bookmark: Bookmark.relations({
        business: rel.belongsTo(Business, {
          from: "businessId",
          to: "id",
        }),
        user: rel.belongsTo(User, {
          from: "userId",
          to: "id",
        }),
      }).sql(({ cols, constraints }) => ({
        table: "Bookmark",
        foreignKeys: [
          constraints.foreignKey(cols.businessId, Business.refs.id),
          constraints.foreignKey(cols.userId, User.refs.id),
        ],
        unique: [
          [cols.userId, cols.businessId],
        ],
      })),

      AppReview: AppReview.relations({
        user: rel.belongsTo(User, {
          from: "userId",
          to: "id",
        }),
      }).sql(({ cols, constraints }) => ({
        table: "AppReview",
        foreignKeys: [
          constraints.foreignKey(cols.userId, User.refs.id),
        ],
        indexes: [
          constraints.index([cols.isApproved]),
          constraints.index([cols.createdAt]),
        ],
      })),
    },
  };
});