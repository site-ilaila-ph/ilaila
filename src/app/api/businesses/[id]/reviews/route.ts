import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { join } from "node:path/posix";
import type { ReviewImageCreateInput } from "@/generated/prisma/models";
import { Prisma } from "@/generated/prisma/client";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient, acquireStorageManager } from "@/lib/infra";
import { createClient } from "@/lib/supabase/server";
import { badRequestProblem, conflictProblem, created, notFoundProblem, unauthorizedProblem } from "@/lib/api/responses";

export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ReviewInput = {
  businessId: string;
  text?: string;
  foodQuality?: number;
  service?: number;
  ambiance?: number;
  value?: number;
};

type ReviewMetadata = {
  review: ReviewInput;
  images?: ReviewImageCreateInput[];
};

function mapReviewPrismaError(req: NextRequest, error: unknown): NextResponse {
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

async function postReview(req: NextRequest) {
  const fd = await req.formData();
  const metadataRaw = fd.get("metadata");

  if (typeof metadataRaw !== "string") {
    return badRequestProblem(req, { code: "metadata-required", detail: "A metadata JSON part is required." });
  }

  let parsed: ReviewMetadata;
  try {
    parsed = JSON.parse(metadataRaw);
  } catch {
    return badRequestProblem(req, { code: "metadata-invalid-json", detail: "metadata part must be valid JSON." });
  }

  if (!parsed?.review) {
    return badRequestProblem(req, { code: "review-required", detail: "metadata.review is required." });
  }

  const { businessId, userId, text, foodQuality, service, ambiance, value } = parsed.review;

  if (!businessId || !UUID_PATTERN.test(businessId)) {
    return badRequestProblem(req, {
      code: "business-id-required",
      detail: "A valid business id is required in metadata.review.businessId.",
    });
  }

  if (
    typeof text !== "string" ||
    typeof foodQuality !== "number" ||
    typeof service !== "number" ||
    typeof ambiance !== "number" ||
    typeof value !== "number"
  ) {
    return badRequestProblem(req, {
      code: "review-fields-required",
      detail: "metadata.review requires text, foodQuality, service, ambiance, and value.",
    });
  }

  // Resolve the reviewer from the signed-in session instead of trusting a
  // client-supplied user id.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const authUser = data?.claims;
  if (!authUser) {
    return unauthorizedProblem(req, {
      code: "review-auth-required",
      detail: "You need to sign in before posting a review.",
    });
  }

  const db = acquirePrismaClient();
  const reviewer = await db.userData.findFirst({
    select: { id: true },
    where: { authId: authUser.sub },
  });
  if (!reviewer) {
    return badRequestProblem(req, {
      code: "review-user-required",
      detail: "No user profile exists for the signed-in account.",
    });
  }

  const imageFiles = fd.getAll("images").filter((f): f is File => f instanceof File);
  const imagesMeta = parsed.images ?? [];

  if (imagesMeta.length > 0 && imagesMeta.length !== imageFiles.length) {
    return badRequestProblem(req, {
      code: "images-files-mismatch",
      detail: `metadata.images has ${imagesMeta.length} entries but ${imageFiles.length} image files were uploaded.`,
    });
  }

  let reviewId: string | undefined;
  let uploadedReviewImageIds: string[] = [];

  try {
    reviewId = randomUUID();
    const storageManager = acquireStorageManager();
    const targetReviewId = reviewId;
    const reviewerId = reviewer.id;

    const uploaded = await Promise.all(
      imageFiles.map(async (blob, i) => {
        const reviewImageId = randomUUID();
        const { url } = await storageManager.upload({
          key: join("reviews", targetReviewId, "images", reviewImageId),
          fileOrBody: blob,
          options: { contentType: blob.type },
        });
        return {
          ...(imagesMeta[i] ?? {}),
          id: reviewImageId,
          url,
        };
      })
    );
    uploadedReviewImageIds = uploaded.map((image) => image.id);

    const review = await db.businessReview.create({
      data: {
        id: reviewId,
        businessId,
        userId: reviewerId,
        text,
        foodQuality,
        service,
        ambiance,
        value,
        upvotes: 0,
        images: uploaded.length > 0 ? { create: uploaded } : undefined,
      },
      include: { images: true },
    });

    return created(review);
  } catch (error: unknown) {
    // Do not leave orphaned objects behind if the DB write fails.
    if (reviewId && uploadedReviewImageIds.length > 0) {
      const storageManager = acquireStorageManager();
      const targetReviewId = reviewId;
      await Promise.allSettled(
        uploadedReviewImageIds.map((imageId) =>
          storageManager.delete({ key: join("reviews", targetReviewId, "images", imageId) })
        )
      );
    }
    return mapReviewPrismaError(req, error);
  }
}

export const POST = withLogging(withUnhandledApiErrorHandling(postReview), "postReview");
