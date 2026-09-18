import { ValidationError } from "@/lib/api/domain-errors";
import { QueryFailedError } from "typeorm";
import { getFoodDetailService, deleteFoodService } from "./food-service";
import { patchFoodWithImages, type FoodPatchImageInput } from "@/repositories/food-repository";

function getQueryFailedCode(err: unknown): string | undefined {
  if (err instanceof QueryFailedError) {
    return (err.driverError as { code?: string })?.code ?? (err as Error & { code?: string }).code;
  }
  if (err instanceof Error && (err as Error & { driverError?: { code?: string } }).driverError) {
    return (err as Error & { driverError: { code?: string } }).driverError?.code ?? (err as Error & { code?: string }).code;
  }
  return (err as Error & { code?: string }).code;
}

export async function patchFoodService(input: {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  foodFields: Record<string, any>;
  images?: FoodPatchImageInput[];
  newFiles: Map<string, Blob>;
  requireMultipart: boolean;
}) {
  if (input.requireMultipart === false) {
    throw new ValidationError({
      code: "multipart-required",
      detail: "PATCH requires multipart/form-data with a 'metadata' part.",
    });
  }
  if (!input.id) throw new ValidationError({ code: "food-id-required", detail: "A food id is required." });
  if (Object.keys(input.foodFields).length === 0 && (!input.images || input.images.length === 0)) {
    throw new ValidationError({ code: "food-nothing-to-update", detail: "No food fields or images were provided." });
  }
  try {
    return await patchFoodWithImages(input);
  } catch (err) {
    const code = getQueryFailedCode(err);
    if (code === "image-not-found") {
      throw new ValidationError({ code: "image-not-found", detail: err.message });
    }
    if (code === "image-file-required") {
      throw new ValidationError({ code: "image-file-required", detail: err.message });
    }
    throw err;
  }
}

export { getFoodDetailService, deleteFoodService };
