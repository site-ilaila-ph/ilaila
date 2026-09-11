import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import z from "zod";
import { Prisma } from "@/generated/prisma/client";
import { acquirePrismaClient } from "@/lib/infra";
import { ok, noContent } from "@/lib/responses/success";
import {
  badRequestProblem,
  conflictProblem,
  internalErrorProblem,
} from "@/lib/responses/problem";

export const runtime = "nodejs";

const createAppReviewSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
  rating: z.number().min(1).max(5),
  text: z.string().min(3),
});

function mapAppReviewReadFailure(request: NextRequest, error: unknown): NextResponse {
  console.error("App review read failed", error);
  return internalErrorProblem(request, { detail: "Unable to load app reviews right now. Please try again later." });
}

function mapAppReviewCreateFailure(request: NextRequest, error: unknown): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem(request, { detail: "The request body must be valid JSON." });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      return badRequestProblem(
        request,
        {
        code: "app-review-invalid-user",
        detail: "The user for this app review does not exist.",
      });
    }

    if (error.code === "P2002") {
      return conflictProblem(
        request, {
        code: "app-review-conflict",
        detail: "This app review already exists.",
      });
    }
  }

  console.error("App review create failed", error);
  return internalErrorProblem(request, { detail: "Unable to submit the app review right now. Please try again later." });
}

async function getAppReviews(request: NextRequest) {
  try {
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
  } catch (error: unknown) {
    return mapAppReviewReadFailure(request, error);
  }
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
    return mapAppReviewCreateFailure(request, error);
  }
}

export const GET = withLogging(getAppReviews, {
  name: "getAppReviews",
  redact: { headers: ["authorization", "cookie"] },
});

export const POST = withLogging(postAppReview, {
  name: "postAppReview",
  redact: { headers: ["authorization", "cookie"], bodyKeys: ["email"] },
});
