import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { Prisma } from "@/generated/prisma/client";
import { acquirePrismaClient } from "@/lib/infra";
import {
  badRequestProblem,
  conflictProblem,
  internalErrorProblem,
  notFoundProblem,
} from "@/lib/responses/problem";

export const runtime = "nodejs";

function mapReviewWriteFailure(request: NextRequest, error: unknown): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem(request, { detail: "The request body must be valid JSON." });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return conflictProblem(request, { code: "review-conflict", detail: "A review for this business already exists." });
    }

    if (error.code === "P2003") {
      return badRequestProblem(
        request,
        {
          code: "review-invalid-reference",
          detail: "The review references a business or user that does not exist.",
        });
    }

    if (error.code === "P2025") {
      return notFoundProblem(request, { code: "review-not-found", detail: "The review does not exist." });
    }
  }

  console.error("Review write failed", error);
  return internalErrorProblem(request, { detail: "Unable to save the review right now. Please try again later." });
}

async function postReview(req: NextRequest) {
  try {
    const body = await req.json();
    const db = acquirePrismaClient();

    if (body.action === "create") {
      const review = await db.review.create({
        data: {
          id: crypto.randomUUID(),
          userId: body.userId,
          businessId: body.businessId,
          text: body.text,
          foodQuality: body.foodQuality,
          service: body.service,
          ambiance: body.ambiance,
          value: body.value,
          upvotes: 0,
        },
      });

      return NextResponse.json({ success: true, data: review }, { status: 201 });
    }

    if (body.action === "upvote") {
      const review = await db.review.findFirst({ where: { id: body.reviewId } });
      if (!review) {
        return notFoundProblem(req, { code: "review-not-found", detail: "The review does not exist." });
      }

      await db.review.update({
        where: { id: body.reviewId },
        data: { upvotes: review.upvotes + 1 },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return badRequestProblem(req, { code: "review-unknown-action", detail: "The review action is not supported." });
  } catch (error: unknown) {
    return mapReviewWriteFailure(req, error);
  }
}

export const POST = withLogging(postReview, {
  name: "postReview",
  redact: { headers: ["authorization", "cookie"] },
});
