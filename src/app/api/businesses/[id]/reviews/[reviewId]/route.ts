
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/api/errors";
import { acquireDatabase } from "@/lib/infra";
import { badRequestProblem, conflictProblem, notFoundProblem, ok } from "@/lib/api/responses";
import { QueryFailedError } from "typeorm";
import { Review } from "@/entities";

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type PatchBody = {
  id: string;
  /** Increment the upvote counter instead of editing fields. */
  upvote?: boolean;
  text?: string;
  foodQuality?: number;
  service?: number;
  ambiance?: number;
  value?: number;
};

function getQueryFailedCode(err: unknown): string | undefined {
  if (err instanceof QueryFailedError) {
    return (err.driverError as { code?: string })?.code ?? (err as Error & { code?: string }).code;
  }
  if (err instanceof Error && (err as Error & { driverError?: { code?: string } }).driverError) {
    return (err as Error & { driverError: { code?: string } }).driverError?.code ?? (err as Error & { code?: string }).code;
  }
  return (err as Error & { code?: string }).code;
}

function mapReviewDetailError(req: NextRequest, error: unknown): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem(req, {
      code: "invalid-json",
      title: "Maling Request",
      detail: "Ang request body ay dapat na valid JSON.",
    });
  }

  if (error instanceof Error) {
    const code = getQueryFailedCode(error);
    if (code === "ENTITY_NOT_FOUND") {
      return notFoundProblem(req, {
        code: "review-not-found",
        detail: "The review does not exist.",
      });
    }

    if (code === "UNIQUE_CONSTRAINT") {
      return conflictProblem(req, {
        code: "review-conflict",
        detail: "A review for this business already exists.",
      });
    }

    if (code === "FOREIGN_KEY_CONSTRAINT") {
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

    const { id, upvote, ...reviewFields } = body;

    // TypeORM transaction handling
    const db = await acquireDatabase();
    const data = await db.transaction(async (tx) => {
      const reviewRepo = tx.getRepository(Review);
      const reviewData: Partial<Review> = {
        ...(upvote ? { upvotes: (await reviewRepo.findOne({ where: { id } }))?.upvotes ? (await reviewRepo.findOne({ where: { id } }))!.upvotes + 1 : 1 } : {}),
        ...(reviewFields.text !== undefined ? { text: reviewFields.text } : {}),
        ...(reviewFields.foodQuality !== undefined ? { foodQuality: reviewFields.foodQuality } : {}),
        ...(reviewFields.service !== undefined ? { service: reviewFields.service } : {}),
        ...(reviewFields.ambiance !== undefined ? { ambiance: reviewFields.ambiance } : {}),
        ...(reviewFields.value !== undefined ? { value: reviewFields.value } : {}),
      };

      await reviewRepo.update({ id }, reviewData);
      const updatedReview = await reviewRepo.findOne({ where: { id } });
      return updatedReview;
    });

    return ok(data);
  } catch (error: unknown) {
    return mapReviewDetailError(req, error);
  }
}

async function deleteReview(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequestProblem(req, { code: "review-id-required", detail: "A review id is required." });
    const db = await acquireDatabase();

    await db.getRepository(Review).delete({ id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapReviewDetailError(req, error);
  }
}

export const PATCH = withLogging(withUnhandledApiErrorHandling(patchReview), "patchReview");
export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteReview), "deleteReview");
export type BusinessReviewUncheckedUpdateInput = Partial<Omit<Review, "id" | "businessId" | "userId" | "createdAt" | "updatedAt">>;
