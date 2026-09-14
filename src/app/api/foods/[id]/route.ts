import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { join } from "node:path/posix";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient, acquireStorageManager } from "@/lib/infra";
import {
  badRequestProblem,
  conflictProblem,
  notFoundProblem,
  ok,
} from "@/lib/api/responses";
import type { Food, FoodImage } from "@/generated/prisma/client";

export const runtime = "nodejs";

type FoodImageCreateInput = Omit<FoodImage, "id" | "foodId" | "url">;

type PatchImageInput = Partial<FoodImageCreateInput> & { id: string };

type PatchBody = Partial<Omit<Food, "id">> & {
  id: string;
  images?: PatchImageInput[];
};

function mapFoodDetailPrismaError(req: NextRequest, error: unknown): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem(req, {
      code: "invalid-json",
      title: "Maling Request",
      detail: "Ang request body ay dapat na valid JSON.",
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

async function patchFood(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return badRequestProblem(req, {
      code: "multipart-required",
      detail: "PATCH requires multipart/form-data with a 'metadata' part.",
    });
  }

  const db = acquirePrismaClient();

  try {
    const fd = await req.formData();
    const metadataRaw = fd.get("metadata");
    if (typeof metadataRaw !== "string") {
      return badRequestProblem(req, { code: "metadata-required", detail: "A metadata JSON part is required." });
    }

    let body: PatchBody;
    try {
      body = JSON.parse(metadataRaw);
    } catch {
      return badRequestProblem(req, { code: "metadata-invalid-json", detail: "metadata part must be valid JSON." });
    }

    if (!body.id) {
      return badRequestProblem(req, { code: "food-id-required", detail: "A food id is required." });
    }

    const { id, images, ...foodFields } = body;

    // Validate any referenced images actually belong to this food before touching storage/DB.
    if (images && images.length > 0) {
      const existingImages = await db.foodImage.findMany({
        where: { id: { in: images.map((i) => i.id) }, foodId: id },
      });
      const foundIds = new Set(existingImages.map((i) => i.id));
      const missing = images.filter((i) => !foundIds.has(i.id));
      if (missing.length > 0) {
        return badRequestProblem(req, {
          code: "image-not-found",
          detail: `Image(s) not found for this food: ${missing.map((i) => i.id).join(", ")}`,
        });
      }
    }

    // Replace files where provided (field name 'image:<imageId>'), before writing DB rows.
    const imageUpdates = await Promise.all(
      (images ?? []).map(async (img) => {
        const file = fd.get(`image:${img.id}`);
        if (file instanceof Blob) {
          const { url } = await acquireStorageManager().upload({
            key: join("foods", id, "images", img.id),
            fileOrBody: file,
            options: { contentType: file.type },
          });
          return { ...img, url };
        }
        return img;
      })
    );

    const data = await db.$transaction(async (tx) => {
      const updatedFood = await tx.food.update({
        where: { id },
        data: {
          ...foodFields,
          images: imageUpdates.length > 0
            ? {
                update: imageUpdates.map(({ id: imageId, ...rest }) => ({
                  where: { id: imageId },
                  data: rest,
                })),
              }
            : undefined,
        },
        include: { images: true },
      });
      return updatedFood;
    });

    return ok(data);
  } catch (error: unknown) {
    return mapFoodDetailPrismaError(req, error);
  }
}

async function deleteFood(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequestProblem(req, { code: "food-id-required", detail: "A food id is required." });
    const db = acquirePrismaClient();
    await db.food.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapFoodDetailPrismaError(req, error);
  }
}

export const PATCH = withLogging(withUnhandledApiErrorHandling(patchFood), "patchFood");
export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteFood), "deleteFood");