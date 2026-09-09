"use server";

import { acquirePrismaClient } from "@/lib/infra";
import { getAllFood, getFoodById, getFoodByName, getTopRatedFoods } from "@/app/foods/services";

export const getFoodItemsAction = async () => {
  const db = acquirePrismaClient();
  return getAllFood(db);
};

export const getFoodItemByIdAction = async (id: string) => {
  const db = acquirePrismaClient();
  return getFoodById(id, db);
};

export const getFoodItemByNameAction = async (name: string) => {
  const db = acquirePrismaClient();
  return getFoodByName(name, db);
};

export const getTopRatedFoodsAction = async () => {
  const db = acquirePrismaClient();
  return getTopRatedFoods(db);
};
