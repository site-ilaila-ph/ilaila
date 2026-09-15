import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { join } from "node:path/posix";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient, acquireStorageManager } from "@/lib/infra";
import { badRequestProblem, conflictProblem, notFoundProblem, ok } from "@/lib/api/responses";
import type { ReviewImage } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";

type ReviewImageUpdate = Partial<Omit<ReviewImage, "id" | "reviewId">>;

type ReviewImageRowToCreate = Omit<ReviewImage, "reviewId">;

type PatchImageInput = ReviewImageUpdate & {
  id: string;
  /** Mark as a new image; a matching `image:<id>` file part is required. */
  new?: boolean;
  /** Mark an existing image for removal (row and stored object). */
  remove?: boolean;
};

type PatchBody = {
  id: string;
  /** Increment the upvote counter instead of editing fields. */
  upvote?: boolean;
  text?: string;
  foodQuality?: number;
  service?: number;
  ambiance?: number;
  value?: number;
  images?: PatchImageInput[];
};

function mapReviewDetailPrismaError(req: NextRequest, error: unknown): NextResponse {
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
        code: "review-not-found",
        detail: "The review does not exist.",
      });
    }

    if (error.code === "P2002") {
      return conflictProblem(req, {
        code: "review-conflict",
        detail: "A review for this business already exists.",
      });
    }

    if (error.code === "P2003") {
      return badRequestProblem(req, {
        code: "review-invalid-reference",
        detail: "The review references a business or user that does not exist.",
      });
    }
  }

  throw error;
}

async function patchReview(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return badRequestProblem(req, {
      code: "multipart-required",
      detail: "PATCH requires multipart/form-data with a 'metadata' part.",
    });
  }

  const db = acquirePrismaClient();

  let reviewId: string | undefined;
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
      return badRequestProblem(req, { code: "review-id-required", detail: "A review id is required." });
    }

    const { id, images, upvote, ...reviewFields } = body;
    reviewId = id;

    const toUpdate = images?.filter((img) => !img.new && !img.remove) ?? [];
    const toCreate = images?.filter((img) => img.new) ?? [];
    const toRemove = images?.filter((img) => img.remove) ?? [];

    // Validate any referenced images actually belong to this review before
    // touching storage/DB.
    const referencedIds = [...toUpdate, ...toRemove].map((img) => img.id);
    if (referencedIds.length > 0) {
      const existingImages = await db.reviewImage.findMany({
        where: { id: { in: referencedIds }, reviewId: id },
        select: { id: true },
      });
      const foundIds = new Set(existingImages.map((img) => img.id));
      const missing = referencedIds.filter((imageId) => !foundIds.has(imageId));
      if (missing.length > 0) {
        return badRequestProblem(req, {
          code: "image-not-found",
          detail: `Image(s) not found for this review: ${missing.join(", ")}`,
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
    const imagesToCreate: ReviewImageRowToCreate[] = [];
    for (const img of toCreate) {
      const file = fd.get(`image:${img.id}`) as File;
      const newImageId = randomUUID();
      const { url } = await storageManager.upload({
        key: join("reviews", id, "images", newImageId),
        fileOrBody: file,
        options: { contentType: file.type },
      });
      newlyCreatedImageIds.push(newImageId);
      imagesToCreate.push({
        id: newImageId,
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
                key: join("reviews", id, "images", img.id),
                fileOrBody: file,
                options: { contentType: file.type },
              })
            : null;
        const data: ReviewImageUpdate = {
          ...(img.description !== undefined ? { description: img.description } : {}),
        };
        if (updatedFile) data.url = updatedFile.url;
        return {
          where: { id: img.id },
          data,
        };
      })
    );

    const hasImageOps =
      imageUpdates.length > 0 || imagesToCreate.length > 0 || toRemove.length > 0;

    const data = await db.$transaction(async (tx) => {
      const reviewData: Prisma.BusinessReviewUncheckedUpdateInput = {
        ...(upvote ? { upvotes: { increment: 1 } } : {}),
        ...(reviewFields.text !== undefined ? { text: reviewFields.text } : {}),
        ...(reviewFields.foodQuality !== undefined ? { foodQuality: reviewFields.foodQuality } : {}),
        ...(reviewFields.service !== undefined ? { service: reviewFields.service } : {}),
        ...(reviewFields.ambiance !== undefined ? { ambiance: reviewFields.ambiance } : {}),
        ...(reviewFields.value !== undefined ? { value: reviewFields.value } : {}),
        images: hasImageOps
          ? {
              update: imageUpdates.length > 0 ? imageUpdates : undefined,
              create: imagesToCreate.length > 0 ? imagesToCreate : undefined,
              deleteMany:
                toRemove.length > 0
                  ? { id: { in: toRemove.map((img) => img.id) } }
                  : undefined,
            }
          : undefined,
      };

      const updatedReview = await tx.businessReview.update({
        where: { id },
        data: reviewData,
        include: { images: true },
      });
      return updatedReview;
    });

    // Remove the stored files of deleted images only after the transaction
    // commits, so a failed write never destroys referenced objects.
    const removals = await Promise.allSettled(
      toRemove.map((img) =>
        storageManager.delete({ key: join("reviews", id, "images", img.id) })
      )
    );
    removals.forEach((result) => {
      if (result.status === "rejected") {
        console.error("patchReview: failed to remove image object", result.reason);
      }
    });

    return ok(data);
  } catch (error: unknown) {
    // If an upload/transaction failed, remove any newly uploaded files so they
    // don't become orphaned objects.
    if (reviewId && newlyCreatedImageIds.length > 0) {
      const storageManager = acquireStorageManager();
      const targetReviewId = reviewId;
      await Promise.allSettled(
        newlyCreatedImageIds.map((imageId) =>
          storageManager.delete({ key: join("reviews", targetReviewId, "images", imageId) })
        )
      );
    }
    return mapReviewDetailPrismaError(req, error);
  }
}

async function deleteReview(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequestProblem(req, { code: "review-id-required", detail: "A review id is required." });
    const db = acquirePrismaClient();
    const storageManager = acquireStorageManager();

    // Collect every storage key that may belong to this review: the objects
    // referenced by its ReviewImage rows plus any stray objects under the
    // review's folder (e.g. leftovers from earlier failures).
    const keysToDelete = new Set<string>();
    const imageRows = await db.reviewImage.findMany({
      where: { reviewId: id },
      select: { id: true },
    });
    imageRows.forEach((img) =>
      keysToDelete.add(join("reviews", id, "images", img.id))
    );
    for (const folder of [join("reviews", id), join("reviews", id, "images")]) {
      const { blobs } = await storageManager.list({ prefix: folder });
      blobs.forEach((blob) => keysToDelete.add(blob.pathname));
    }

    // Remove objects first (best-effort) so no orphaned files are left behind,
    // then delete the DB record (its image rows go with it via cascade) even
    // if a storage removal failed.
    const removals = await Promise.allSettled(
      [...keysToDelete].map((key) => storageManager.delete({ key }))
    );
    removals.forEach((result) => {
      if (result.status === "rejected") {
        console.error("deleteReview: failed to remove storage object", result.reason);
      }
    });

    await db.businessReview.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapReviewDetailPrismaError(req, error);
  }
}

export const PATCH = withLogging(withUnhandledApiErrorHandling(patchReview), "patchReview");

export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteReview), "deleteReview");
