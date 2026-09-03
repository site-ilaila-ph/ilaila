"use server";

import { toServerAction } from "@/lib/action/server";
import { acquireDb } from "@/lib/infra";
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
    const db = acquireDb();
    
    return await db.appReview.create({
      data: {
        userId: input.userId || null,
        userName: input.userName || null,
        email: input.email || null,
        rating: input.rating,
        text: input.text,
        isApproved: false,
      },
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
    const db = acquireDb();
    
    return await db.appReview.update({
      where: { id: input.id },
      data: { isApproved: input.isApproved },
    });
  },
  schema: updateAppReviewStatusSchema,
});

export const deleteAppReviewAction = toServerAction({
  serviceFn: async (id: string) => {
    const db = acquireDb();
    return await db.appReview.delete({ where: { id } });
  },
  schema: z.string(),
});
