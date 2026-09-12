import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import z from "zod";
import { acquirePrismaClient } from "@/lib/infra";
import { ok, noContent } from "@/lib/responses/success";
import { badRequestProblem } from "@/lib/responses/problem";
import { mapPrismaError, ApiErrorCode } from "@/lib/errors";

export const runtime = "nodejs";

const createAppReviewSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
  rating: z.number().min(1).max(5),
  text: z.string().min(3),
});

async function getAppReviews(request: NextRequest) {
  const db = acquirePrismaClient();
  const reviews = await db.appReview.findMany({
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return ok(reviews);
}

async function postAppReview(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createAppReviewSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestProblem(request, {
        code: "app-review-invalid",
        detail: "The app review could not be validated.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const db = acquirePrismaClient();
    await db.appReview.create({
      data: {
        id: crypto.randomUUID(),
        userId: parsed.data.userId,
        email: parsed.data.email,
        rating: parsed.data.rating,
        text: parsed.data.text,
      },
    });

    return noContent();
  } catch (error: unknown) {
    return mapPrismaError(request, error, {
      idRequiredCode: "APP_REVIEW_INVALID_USER" as ApiErrorCode,
      notFoundCode: "APP_REVIEW_INVALID_USER" as ApiErrorCode,
      conflictCode: "APP_REVIEW_CONFLICT" as ApiErrorCode,
      invalidRefCode: "APP_REVIEW_INVALID_USER" as ApiErrorCode,
    });
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getAppReviews), "getAppReviews");

export const POST = withLogging(withUnhandledApiErrorHandling(postAppReview), "postAppReview");
