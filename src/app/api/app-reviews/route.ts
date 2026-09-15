import { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withDomainErrorBoundary } from "@/lib/api/boundary";
import { ValidationError } from "@/lib/api/domain-errors";
import z from "zod";
import { ok, noContent } from "@/lib/api/responses";
import { listAppReviewsService, createAppReviewService } from "@/lib/services/management";

export const runtime = "nodejs";

const createAppReviewSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
  rating: z.number().min(1).max(5),
  text: z.string().min(3),
});

async function getAppReviews() {
  return ok(await listAppReviewsService());
}

async function postAppReview(request: NextRequest) {
  const body = await request.json();
  const parsed = createAppReviewSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError({
      code: "app-review-invalid",
      detail: "The app review could not be validated.",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  await createAppReviewService(parsed.data);
  return noContent();
}

export const GET = withLogging(withDomainErrorBoundary(getAppReviews), "getAppReviews");

export const POST = withLogging(withDomainErrorBoundary(postAppReview), "postAppReview");

export type { NextResponse };

