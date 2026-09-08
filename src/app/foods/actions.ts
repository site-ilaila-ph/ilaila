"use server";

import z from "zod";
import { toServerAction } from "@/lib/action/server";
import { acquirePrismaClient } from "@/lib/infra";
import type { Contract } from "@/prisma/contract.d";
import type { PostgresClient } from "@internal/postgres/runtime";
import { getAllFood, getFoodById, getFoodByName, getTopRatedFoods } from "@/app/foods/services";

const foodActionDependencies = () => ({
  db: acquirePrismaClient(),
});

export const getFoodItemsAction = toServerAction({
  serviceFn: async (
    _params: Record<string, never>,
    deps: { db: PostgresClient<Contract> } = foodActionDependencies(),
  ) => getAllFood(deps.db),
  schema: z.object({}),
  dependencies: foodActionDependencies,
});

export const getFoodItemByIdAction = toServerAction({
  serviceFn: async (
    id: string,
    deps: { db: PostgresClient<Contract> } = foodActionDependencies(),
  ) => getFoodById(id, deps.db),
  schema: z.string().min(1),
  dependencies: foodActionDependencies,
});

export const getFoodItemByNameAction = toServerAction({
  serviceFn: async (
    name: string,
    deps: { db: PostgresClient<Contract> } = foodActionDependencies(),
  ) => getFoodByName(name, deps.db),
  schema: z.string().min(1),
  dependencies: foodActionDependencies,
});

export const getTopRatedFoodsAction = toServerAction({
  serviceFn: async (
    limit: number = 3,
    deps: { db: PostgresClient<Contract> } = foodActionDependencies(),
  ) => getTopRatedFoods(limit, deps.db),
  schema: z.number().int().min(1).default(3),
  dependencies: foodActionDependencies,
});
