import { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import z from "zod";
import { acquirePrismaClient } from "@/lib/infra";
import {
  badRequestProblem,
  conflictProblem,
  notFoundProblem,
  ok,
  noContent,
} from "@/lib/api/responses";

export const runtime = "nodejs";

const createAppReviewSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
  rating: z.number().min(1).max(5),
  text: z.string().min(3),
});

async function getAppReviews() {
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
    if (error instanceof SyntaxError) {
      return badRequestProblem(request, {
        code: "invalid-json",
        title: "Maling Request",
        detail: "Ang request body ay dapat na valid JSON.",
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return conflictProblem(request, {
        code: "app-review-conflict",
        title: "Salungatan",
        detail: "Ang app review na ito ay mayroon na.",
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2025")
    ) {
      return notFoundProblem(request, {
        code: "app-review-invalid-user",
        title: "Maling Request",
        detail: "Ang user para sa app review na ito ay hindi umiiral.",
      });
    }

    throw error;
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getAppReviews), "getAppReviews");

export const POST = withLogging(withUnhandledApiErrorHandling(postAppReview), "postAppReview");
