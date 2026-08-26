"use server";

import z from "zod";
import toServerAction from "@/lib/server/actions";
import { acquireDb } from "@/lib/server/db";
import type { PrismaClient } from "@/generated/prisma/client";
import { getAllFood, getFoodById } from "@/app/foods/services/food.service";

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
