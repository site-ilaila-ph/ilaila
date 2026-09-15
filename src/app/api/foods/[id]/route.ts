import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { randomUUID } from "node:crypto";
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

type FoodImageUpdate = Partial<Omit<FoodImage, "id" | "foodId">>;

type FoodImageRowToCreate = Omit<FoodImage, "foodId">;

type PatchImageInput = FoodImageUpdate & {
  id: string;
  /** Mark as a new image; a matching `image:<id>` file part is required. */
  new?: boolean;
  /** Mark an existing image for removal (row and stored object). */
  remove?: boolean;
};

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

async function getFood(req: NextRequest, { params }: { params: Promise<{ id: string}> }) {
  const db = acquirePrismaClient();
  const data = await db.food.findFirst({
    include: {
      images: true,
      _count: { select: { businesses: true } },
    },
    where: { id: (await params).id },
  });
  return NextResponse.json(data, { status: 200 });
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

  let foodId: string | undefined;
  const newlyCreatedImageIds: string[] = [];

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
    foodId = id;

    const toUpdate = images?.filter((img) => !img.new && !img.remove) ?? [];
    const toCreate = images?.filter((img) => img.new) ?? [];
    const toRemove = images?.filter((img) => img.remove) ?? [];

    // Validate any referenced images actually belong to this food before
    // touching storage/DB.
    const referencedIds = [...toUpdate, ...toRemove].map((img) => img.id);
    if (referencedIds.length > 0) {
      const existingImages = await db.foodImage.findMany({
        where: { id: { in: referencedIds }, foodId: id },
        select: { id: true },
      });
      const foundIds = new Set(existingImages.map((img) => img.id));
      const missing = referencedIds.filter((imageId) => !foundIds.has(imageId));
      if (missing.length > 0) {
        return badRequestProblem(req, {
          code: "image-not-found",
          detail: `Image(s) not found for this food: ${missing.join(", ")}`,
        });
      }
    }

    const storageManager = acquireStorageManager();

    // Validate before uploading so a single missing file cannot orphan the
    // uploads of its siblings.
    for (const img of toCreate) {
      if (!(fd.get(`image:${img.id}`) instanceof Blob)) {
        return badRequestProblem(req, {
          code: "image-file-required",
          detail: `A file is required for new image '${img.id}'.`,
        });
      }
    }

    // New images: upload each file and record the row to create.
    const imagesToCreate: FoodImageRowToCreate[] = [];
    for (const img of toCreate) {
      const file = fd.get(`image:${img.id}`) as File;
      const newImageId = randomUUID();
      const { url } = await storageManager.upload({
        key: join("foods", id, "images", newImageId),
        fileOrBody: file,
        options: { contentType: file.type },
      });
      newlyCreatedImageIds.push(newImageId);
      imagesToCreate.push({
        id: newImageId,
        position: img.position ?? 0,
        description: img.description ?? "",
        url,
      });
    }

    // Existing images: replace the file when an `image:<id>` part is present.
    const imageUpdates = await Promise.all(
      toUpdate.map(async (img) => {
        const file = fd.get(`image:${img.id}`);
        const updatedFile =
          file instanceof Blob
            ? await storageManager.upload({
                key: join("foods", id, "images", img.id),
                fileOrBody: file,
                options: { contentType: file.type },
              })
            : null;
        const data: FoodImageUpdate = {
          ...(img.description !== undefined ? { description: img.description } : {}),
          ...(img.position !== undefined ? { position: img.position } : {}),
        };
        if (updatedFile) data.url = updatedFile.url;
        return {
          where: { id: img.id },
          data,
        };
      })
    );

    const data = await db.$transaction(async (tx) => {
      const updatedFood = await tx.food.update({
        where: { id },
        data: {
          ...foodFields,
          images:
            imageUpdates.length > 0 ||
            imagesToCreate.length > 0 ||
            toRemove.length > 0
              ? {
                  update: imageUpdates.length > 0 ? imageUpdates : undefined,
                  create: imagesToCreate.length > 0 ? imagesToCreate : undefined,
                  deleteMany:
                    toRemove.length > 0
                      ? { id: { in: toRemove.map((img) => img.id) } }
                      : undefined,
                }
              : undefined,
        },
        include: { images: true },
      });
      return updatedFood;
    });

    // Remove the stored files of deleted images only after the transaction
    // commits, so a failed write never destroys referenced objects.
    const removals = await Promise.allSettled(
      toRemove.map((img) =>
        storageManager.delete({ key: join("foods", id, "images", img.id) })
      )
    );
    removals.forEach((result) => {
      if (result.status === "rejected") {
        console.error("patchFood: failed to remove image object", result.reason);
      }
    });

    return ok(data);
  } catch (error: unknown) {
    // If an upload/transaction failed, remove any newly uploaded files so they
    // don't become orphaned objects.
    if (foodId && newlyCreatedImageIds.length > 0) {
      const storageManager = acquireStorageManager();
      const targetFoodId = foodId;
      await Promise.allSettled(
        newlyCreatedImageIds.map((imageId) =>
          storageManager.delete({ key: join("foods", targetFoodId, "images", imageId) })
        )
      );
    }
    return mapFoodDetailPrismaError(req, error);
  }
}

async function deleteFood(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequestProblem(req, { code: "food-id-required", detail: "A food id is required." });
    const db = acquirePrismaClient();
    const storageManager = acquireStorageManager();

    // Collect every storage key that may belong to this food: the objects
    // referenced by its FoodImage rows plus any stray objects under the food's
    // folder (e.g. leftovers from earlier failures).
    const keysToDelete = new Set<string>();
    const imageRows = await db.foodImage.findMany({
      where: { foodId: id },
      select: { id: true },
    });
    imageRows.forEach((img) =>
      keysToDelete.add(join("foods", id, "images", img.id))
    );
    for (const folder of [join("foods", id), join("foods", id, "images")]) {
      const { blobs } = await storageManager.list({ prefix: folder });
      blobs.forEach((blob) => keysToDelete.add(blob.pathname));
    }

    // Remove objects first (best-effort) so no orphaned files are left behind,
    // then delete the DB record even if a storage removal failed.
    const removals = await Promise.allSettled(
      [...keysToDelete].map((key) => storageManager.delete({ key }))
    );
    removals.forEach((result) => {
      if (result.status === "rejected") {
        console.error("deleteFood: failed to remove storage object", result.reason);
      }
    });

    await db.food.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapFoodDetailPrismaError(req, error);
  }
}


export const GET = withLogging(withUnhandledApiErrorHandling(getFood), "getFood");
export const PATCH = withLogging(withUnhandledApiErrorHandling(patchFood), "patchFood");
export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteFood), "deleteFood");