import type { FoodCreateInput, FoodImageCreateInput } from "@/generated/prisma/models";
import { Prisma } from "@/generated/prisma/client";
import { badRequestProblem, conflictProblem, notFoundProblem, ok } from "@/lib/api/responses";
import { isMissingIdError, withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient, acquireStorageManager } from "@/lib/infra";
import { withLogging } from "@/lib/logging";
import { randomUUID } from "node:crypto";
import { join } from "node:path/posix";
import { NextRequest } from "next/server";
import { parseListOptions, type ListOptionsError } from "@/lib/api/list-options";
import { listFoods, sortableFields, filterableFields, includeableRelations } from "@/lib/repos/food";

function mapFoodPrismaError(req: NextRequest, error: unknown): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem(req, {
      code: "invalid-json",
      title: "Maling Request",
      detail: "Ang request body ay dapat na valid JSON.",
    });
  }

  if (isMissingIdError(error)) {
    return badRequestProblem(req, {
      code: "food-id-required",
      title: "Maling Request",
      detail: "Kinakailangan ng food id.",
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return notFoundProblem(req, {
        code: "food-not-found",
        title: "Hindi Nakita",
        detail: "Ang pagkain ay hindi umiiral.",
      });
    }

    if (error.code === "P2002") {
      return conflictProblem(req, {
        code: "food-conflict",
        title: "Salungatan",
        detail: "Mayroon nang pagkain na may parehong mga field.",
      });
    }

    if (error.code === "P2003") {
      return badRequestProblem(req, {
        code: "food-invalid-reference",
        title: "Maling Request",
        detail: "Ang pagkain ay nagre-record ng record na hindi umiiral.",
      });
    }
  }

  throw error;
}

async function getFoods(req: NextRequest) {
  try {
    const options = parseListOptions(
      req.nextUrl.searchParams,
      sortableFields,
      filterableFields,
      includeableRelations,
    );
    const data = await listFoods(options);
    return ok(data);
  } catch (err) {
    if (err instanceof ListOptionsError) {
      return badRequestProblem(req, {
        code: "bad-list-options",
        title: "Maling Request",
        detail: err.message,
      });
    }
    throw err;
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

  const imageFiles = fd.getAll("images").filter((f): f is File => f instanceof File);
  const imagesMeta = parsed.images ?? [];

  if (imagesMeta.length > 0 && imagesMeta.length !== imageFiles.length) {
    return badRequestProblem(req, {
      code: "images-files-mismatch",
      detail: `metadata.images has ${imagesMeta.length} entries but ${imageFiles.length} image files were uploaded.`,
    });
  }

  let foodId: string | undefined;
  let uploadedFoodImageIds: string[] = [];

  try {
    const db = acquirePrismaClient();
    foodId = randomUUID();
    const storageManager = acquireStorageManager();
    const targetFoodId = foodId;

    const uploaded = await Promise.all(
      imageFiles.map(async (blob, i) => {
        const foodImageId = randomUUID();
        const { url } = await storageManager.upload({
          key: join("foods", targetFoodId, "images", foodImageId),
          fileOrBody: blob,
          options: { contentType: blob.type },
        });
        return {
          ...(imagesMeta[i] ?? {}),
          id: foodImageId,
          url,
        };
      })
    );
    uploadedFoodImageIds = uploaded.map((image) => image.id);

    const food = await db.food.create({
      data: {
        id: foodId,
        ...parsed.food,
        images: uploaded.length > 0 ? { create: uploaded } : undefined,
      },
      include: { images: true },
    });

    return ok(food);
  } catch (error: unknown) {
    // Do not leave orphaned objects behind if the DB write fails.
    if (foodId && uploadedFoodImageIds.length > 0) {
      const storageManager = acquireStorageManager();
      const targetFoodId = foodId;
      await Promise.allSettled(
        uploadedFoodImageIds.map((imageId) =>
          storageManager.delete({ key: join("foods", targetFoodId, "images", imageId) })
        )
      );
    }
    return mapFoodPrismaError(req, error);
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getFoods), "getFoods");
export const POST = withLogging(withUnhandledApiErrorHandling(createFood), "createFood");