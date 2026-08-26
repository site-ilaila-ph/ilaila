"use server";

import z from "zod";
import toServerAction from "../actions";
import { FoodService } from "./food.service";

export const getFoodItemsAction = toServerAction({
  schema: z.object({}), 
  serviceFn: async (_) => {
    return await FoodService.getAllFood();
  },
});

export const getFoodItemByIdAction = toServerAction({
  schema: z.object({
    id: z.string().min(1, "Food ID is required"),
  }),
  serviceFn: async ({ id }) => {
    return await FoodService.getFoodById(id);
  },
});