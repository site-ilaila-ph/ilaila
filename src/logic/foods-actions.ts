"use server";

import z from "zod";
import { actionify } from "@/lib/action/server";
import { getAllFood, getFoodById, getFoodByName, getTopRatedFoods } from "@/logic/foods";

export const getFoodItemsAction = actionify(
  async ({}) => getAllFood(),
  z.object({})
);

export const getFoodItemByIdAction = actionify(
  async ({ id }: { id: string }) => getFoodById(id),
  z.object({ id: z.string().uuid("Invalid UUID format") })
);

export const getFoodItemByNameAction = actionify(
  async ({ name }: { name: string }) => getFoodByName(name),
  z.object({ name: z.string().min(1, "Name is required") })
);

export const getTopRatedFoodsAction = actionify(
  async ({}) => getTopRatedFoods(),
  z.object({})
);
