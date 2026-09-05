import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { getAllFood, getFoodById } from "@/app/(session-gated)/foods/services";

describe("food service", () => {
  it("getAllFood returns all food items with related images and tags", async () => {
    const foodItems = [
      {
        id: "food-1",
        name: "Adobong Baboy at Manok",
        images: [
          {
            id: "img-1",
            foodId: "food-1",
            description: "main",
          },
        ],
        tags: [
          { 
            id: "tag-1",
            value: "heritage",
            foodId: "food-1",
          },
        ],
      },
    ];

    const mockDb = {
      food: {
        findMany: vi.fn().mockResolvedValue(foodItems),
      },
    } as unknown as Pick<PrismaClient, "food">;

    const result = await getAllFood(mockDb);

    expect(mockDb.food.findMany).toHaveBeenCalledWith({
      include: {
        images: true,
        tags: true,
      },
      orderBy: { name: "asc" },
    });

    expect(result).toEqual(foodItems);
  });

  it("getFoodById returns a single food with images, tags, and business relations", async () => {
    const foodItem = {
      id: "food-1",
      name: "Adobong Baboy at Manok",
      description: "Tender braised meat",
      history: "Traditional Filipino dish",
      preparation: "Marinate and simmer",
      recipe: "pork, chicken, vinegar",
      culturalSignificance: "Beloved heritage food",
      isHeritage: true,
      images: [
        {
          id: "img-1",
          foodId: "food-1",
          description: "main",
        },
      ],
      tags: [
        {
          id: "tag-1",
          value: "heritage",
          foodId: "food-1",
        },
      ],
      businesses: [
        {
          id: "bf-1",
          businessId: "biz-1",
          foodId: "food-1",
          business: {
            id: "biz-1",
            name: "Aling Nena's",
          },
        },
      ],
    };

    const mockDb = {
      food: {
        findUnique: vi.fn().mockResolvedValue(foodItem),
      },
    } as unknown as Pick<PrismaClient, "food">;

    const result = await getFoodById("food-1", mockDb);

    expect(mockDb.food.findUnique).toHaveBeenCalledWith({
      where: {
        id: "food-1",
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
    });

    expect(result).toEqual(foodItem);
  });

});