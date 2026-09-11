import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { Prisma } from "@/generated/prisma/client";
import { acquirePrismaClient } from "@/lib/infra";
import {
  badRequestProblem,
  internalErrorProblem,
  notFoundProblem,
} from "@/lib/responses/problem";

function mapManagementReviewFailure(error: unknown): NextResponse {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return notFoundProblem({ code: "review-not-found", detail: "The review does not exist." });
  }

  if (
    error instanceof Prisma.PrismaClientValidationError &&
    /Argument `id` is missing/i.test(error.message)
  ) {
    return badRequestProblem({ code: "review-id-required", detail: "A review id is required." });
  }

  console.error("Management review delete failed", error);
  return internalErrorProblem({ detail: "Unable to delete the review right now. Please try again later." });
}
async function getReviews() {
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
    console.error("Management review read failed", error);
    return internalErrorProblem({ detail: "Unable to load reviews right now. Please try again later." });
  }
}

async function deleteReview(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequestProblem({ code: "review-id-required", detail: "A review id is required." });
    const db = acquirePrismaClient();
    await db.review.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapManagementReviewFailure(error);
  }
}

export const GET = withLogging(getReviews, {
  name: "getReviews",
  redact: { headers: ["authorization", "cookie"] },
});

export const DELETE = withLogging(deleteReview, {
  name: "deleteReview",
  redact: { headers: ["authorization", "cookie"] },
});
