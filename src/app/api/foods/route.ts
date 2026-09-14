import type { ApiErrorCode } from "@/lib/errors";
import type { FoodCreateInput, FoodImageCreateInput } from "@/generated/prisma/models";
import { badRequestProblem, ok } from "@/lib/api/responses";
import { commonErrorHandler } from "@/lib/api/errors";
import { logAndRethrow, mapPrismaError } from "@/lib/errors";
import { acquirePrismaClient, acquireStorageManager } from "@/lib/infra";
import { withApiErrorHandling } from "@/lib/api-wrappers";
import { withLogging } from "@/lib/logging";
import { randomUUID } from "node:crypto";
import { join } from "node:path/posix";
import { NextResponse, NextRequest } from "next/server";

const PRISMA_ERROR_CODES = {
  idRequiredCode: "FOOD_ID_REQUIRED" as ApiErrorCode,
  notFoundCode: "FOOD_NOT_FOUND" as ApiErrorCode,
  conflictCode: "FOOD_CONFLICT" as ApiErrorCode,
  invalidRefCode: "FOOD_INVALID_REFERENCE" as ApiErrorCode,
};

async function getFoods() {
  try {
    const db = acquirePrismaClient();
    const data = await db.food.findMany({
      include: { tags: true, images: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    logAndRethrow("Management food read", error);
  }
}

async function createFood(req: NextRequest) {
  const fd = await req.formData();
  const metadataRaw = fd.get("metadata");

  if (typeof metadataRaw !== "string") {
    return badRequestProblem(req, { code: "metadata-required", detail: "A metadata JSON part is required." });
  }

  let parsed: { food: FoodCreateInput; images?: FoodImageCreateInput[] };
  try {
    parsed = JSON.parse(metadataRaw);
  } catch {
    return badRequestProblem(req, { code: "metadata-invalid-json", detail: "metadata part must be valid JSON." });
  }

  if (!parsed?.food) {
    return badRequestProblem(req, { code: "food-required", detail: "metadata.food is required." });
  }

  const imageFiles = fd.getAll("images").filter((f): f is Blob => f instanceof Blob);
  const imagesMeta = parsed.images ?? [];

  if (imagesMeta.length > 0 && imagesMeta.length !== imageFiles.length) {
    return badRequestProblem(req, {
      code: "images-files-mismatch",
      detail: `metadata.images has ${imagesMeta.length} entries but ${imageFiles.length} image files were uploaded.`,
    });
  }

  try {
    const db = acquirePrismaClient();
    const foodId = randomUUID();

    const uploaded = await Promise.all(
      imageFiles.map(async (blob, i) => {
        const foodImageId = randomUUID();
        const { url } = await acquireStorageManager().upload({
          key: join("foods", foodId, "images", foodImageId),
          fileOrBody: blob,
          options: { contentType: blob.type },
        });
        return {
          id: foodImageId,
          url,
          ...(imagesMeta[i] ?? {}),
        };
      })
    );

    const food = await db.food.create({
      data: {
        id: foodId,
        ...parsed.food,
        images: uploaded.length > 0 ? { create: uploaded } : undefined,
      },
      include: { images: true, tags: true },
    });

    return ok(food);
  } catch (error: unknown) {
    return mapPrismaError(req, error, PRISMA_ERROR_CODES);
  }
}

export const GET = withLogging(withApiErrorHandling(getFoods, commonErrorHandler), "getFoods");
export const POST = withLogging(withApiErrorHandling(createFood, commonErrorHandler), "createFood");