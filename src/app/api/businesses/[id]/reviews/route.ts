import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient } from "@/lib/infra";
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
  const parsed: ReviewInput = await req.json();

  const { businessId, text, foodQuality, service, ambiance, value } = parsed;

  if (!businessId || !UUID_PATTERN.test(businessId)) {
    return badRequestProblem(req, {
      code: "business-id-required",
      detail: "A valid business id is required.",
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
      detail: "The data text, foodQuality, service, ambiance, and value are required.",
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

  const reviewerId = reviewer.id;
  const reviewId = crypto.randomUUID();

  try {
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
      },
    });

    return created(review);
  } catch (error: unknown) {
    return mapReviewPrismaError(req, error);
  }
}

export const POST = withLogging(withUnhandledApiErrorHandling(postReview), "postReview");
