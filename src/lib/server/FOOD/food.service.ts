import prisma from '../db'; // FIXED: Removed the curly braces

export const FoodService = {
  async getAllFood() {
    try {
      return await prisma.food.findMany({
        include: {
          images: true,
          tags: true,
        },
      });
    } catch (error) {
      console.error("🚀 [Backend Error] Failed to fetch food items:", error);
      throw new Error("Database query failed");
    }
  },

  async getFoodById(id: string) {
    try {
      return await prisma.food.findUnique({
        where: { id },
        include: {
          images: true,
          tags: true,
          businesses: true,
        },
      });
    } catch (error) {
      console.error(`🚀 [Backend Error] Failed to fetch food item ${id}:`, error);
      throw new Error("Database query failed");
    }
  }
};
