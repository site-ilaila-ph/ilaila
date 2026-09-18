import { z } from "zod";

export const FoodPatchSchema = z.object({
  id: z.string().min(1, "A food id is required."),
  foodFields: z.record(z.string(), z.unknown()).refine(
    (fields) => Object.keys(fields).length > 0 || false,
    { message: "No food fields or images were provided." }
  ),
  requireMultipart: z.literal(true),
});
