import { acquirePrismaClient } from "@/lib/infra";
import { Prisma } from "@/generated/prisma/client";

export async function findFoodDetailById(id: string) {
  const db = acquirePrismaClient();
  return db.food.findFirst({
    include: { images: true, _count: { select: { businesses: true } } },
    where: { id },
  });
}

export async function createFoodWithImages(input: {
  id: string;
  fields: Prisma.FoodUncheckedCreateInput;
  images: Prisma.FoodImageCreateManyFoodInput[];
}) {
  const db = acquirePrismaClient();
  const { images: _images, id: _id, ...rest } = input.fields;
  void _images; void _id;
  return db.food.create({
    data: {
      ...rest,
      id: input.id,
      images: input.images.length > 0 ? { create: input.images } : undefined,
    },
    include: { images: true },
  });
}

export async function createSimpleFood(input: Omit<Prisma.FoodUncheckedCreateInput, "id">) {
  const db = acquirePrismaClient();
  return db.food.create({
    data: { ...input, id: crypto.randomUUID() },
  });
}

export async function findFoodImageIds(foodId: string): Promise<string[]> {
  const db = acquirePrismaClient();
  const rows = await db.foodImage.findMany({ where: { foodId }, select: { id: true } });
  return rows.map((r) => r.id);
}

export async function findFoodImageIdsByIds(ids: string[], foodId: string): Promise<string[]> {
  const db = acquirePrismaClient();
  const rows = await db.foodImage.findMany({
    where: { id: { in: ids }, foodId },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export async function deleteFoodById(id: string) {
  const db = acquirePrismaClient();
  await db.food.delete({ where: { id } });
  return { success: true };
}
