"use server";

import z from "zod";
import { toServerAction } from "@/lib/action/server";
import { acquireDb } from "@/lib/live";
import type { PrismaClient } from "@/generated/prisma/client";
import { getAllFood, getFoodById, getFoodByName, getTopRatedFoods } from "@/app/foods/services";

const foodActionDependencies = () => ({
  db: acquireDb(),
});

export const getFoodItemsAction = toServerAction({
  serviceFn: async (
    _params: Record<string, never>,
    deps: { db: Pick<PrismaClient, "food"> } = foodActionDependencies(),
  ) => getAllFood(deps.db),
  schema: z.object({}),
  dependencies: foodActionDependencies,
});

export const getFoodItemByIdAction = toServerAction({
  serviceFn: async (
    id: string,
    deps: { db: Pick<PrismaClient, "food"> } = foodActionDependencies(),
  ) => getFoodById(id, deps.db),
  schema: z.string().min(1),
  dependencies: foodActionDependencies,
});

export const getFoodItemByNameAction = toServerAction({
  serviceFn: async (
    name: string,
    deps: { db: Pick<PrismaClient, "food"> } = foodActionDependencies(),
  ) => getFoodByName(name, deps.db),
  schema: z.string().min(1),
  dependencies: foodActionDependencies,
});

export const getTopRatedFoodsAction = toServerAction({
  serviceFn: async (
    limit: number = 3,
    deps: { db: Pick<PrismaClient, "food" | "businessFood" | "review"> } = foodActionDependencies(),
  ) => getTopRatedFoods(limit, deps.db),
  schema: z.number().int().min(1).default(3),
  dependencies: foodActionDependencies,
});
