
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient } from "@/lib/infra";
import { badRequestProblem, conflictProblem, notFoundProblem, ok } from "@/lib/api/responses";
import { Prisma } from "@/generated/prisma/client";
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

    const data = await db.$transaction(async (tx) => {
      const reviewData: Prisma.BusinessReviewUncheckedUpdateInput = {
        ...(upvote ? { upvotes: { increment: 1 } } : {}),
        ...(reviewFields.text !== undefined ? { text: reviewFields.text } : {}),
        ...(reviewFields.foodQuality !== undefined ? { foodQuality: reviewFields.foodQuality } : {}),
        ...(reviewFields.service !== undefined ? { service: reviewFields.service } : {}),
        ...(reviewFields.ambiance !== undefined ? { ambiance: reviewFields.ambiance } : {}),
        ...(reviewFields.value !== undefined ? { value: reviewFields.value } : {}),
      };

      const updatedReview = await tx.businessReview.update({
        where: { id },
        data: reviewData,
      });
      return updatedReview;
    });

    return ok(data);
  } catch (error: unknown) {
    return mapReviewDetailPrismaError(req, error);
  }
}

async function deleteReview(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequestProblem(req, { code: "review-id-required", detail: "A review id is required." });
    const db = acquirePrismaClient();

    await db.businessReview.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapReviewDetailPrismaError(req, error);
  }
}

export const PATCH = withLogging(withUnhandledApiErrorHandling(patchReview), "patchReview");

export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteReview), "deleteReview");
