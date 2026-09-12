import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient } from "@/lib/infra";
import { badRequestProblem } from "@/lib/responses/problem";
import { mapPrismaError, logAndRethrow, ApiErrorCode } from "@/lib/errors";

export const runtime = "nodejs";

async function getReviews(_req: NextRequest) {
  try {
    const db = acquirePrismaClient();
    const data = await db.review.findMany({
      include: {
        user: { include: { authUser: true } },
        business: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    logAndRethrow("Management review read", error);
  }
}

async function deleteReview(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequestProblem(req, { code: "review-id-required", detail: "A review id is required." });
    const db = acquirePrismaClient();
    await db.review.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapPrismaError(req, error, {
      idRequiredCode: "REVIEW_ID_REQUIRED" as ApiErrorCode,
      notFoundCode: "REVIEW_NOT_FOUND" as ApiErrorCode,
      conflictCode: "REVIEW_ID_REQUIRED" as ApiErrorCode,
    });
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getReviews), "getReviews");

export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteReview), "deleteReview");
