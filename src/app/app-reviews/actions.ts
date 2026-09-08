"use server";

import { toServerAction } from "@/lib/action/server";
import { acquirePrismaClient } from "@/lib/infra";
import z from "zod";

const createAppReviewSchema = z.object({
  userId: z.string().optional(),
  userName: z.string().optional(),
  email: z.string().email().optional(),
  rating: z.number().min(1).max(5),
  text: z.string().min(10).max(1000),
});

export const createAppReviewAction = toServerAction({
  serviceFn: async (input: z.infer<typeof createAppReviewSchema>) => {
    const db = acquirePrismaClient();
    
    return await db.orm.AppReview.create({
      id: crypto.randomUUID(),
      userId: input.userId || null,
      userName: input.userName || null,
      email: input.email || null,
      rating: input.rating,
      text: input.text,
      isApproved: false,
    });
  },
  schema: createAppReviewSchema,
});

const updateAppReviewStatusSchema = z.object({
  id: z.string(),
  isApproved: z.boolean(),
});

export const updateAppReviewStatusAction = toServerAction({
  serviceFn: async (input: z.infer<typeof updateAppReviewStatusSchema>) => {
    const db = acquirePrismaClient();
    
    await db.orm.AppReview.where({ id: input.id }).update({ isApproved: input.isApproved });
    return { success: true };
  },
  schema: updateAppReviewStatusSchema,
});

export const deleteAppReviewAction = toServerAction({
  serviceFn: async (id: string) => {
    const db = acquirePrismaClient();
    await db.orm.AppReview.where({ id }).delete();
    return { success: true };
  },
  schema: z.string(),
});
