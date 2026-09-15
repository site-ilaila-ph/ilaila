import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withDomainErrorBoundary } from "@/lib/api/boundary";
import { listAllReviewsService, deleteReviewService } from "@/lib/services/management";

export const runtime = "nodejs";

async function getReviews() {
  return NextResponse.json(await listAllReviewsService(), { status: 200 });
}

async function deleteReview(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  await deleteReviewService(id ?? "");
  return NextResponse.json({ success: true }, { status: 200 });
}

export const GET = withLogging(withDomainErrorBoundary(getReviews), "getReviews");

export const DELETE = withLogging(withDomainErrorBoundary(deleteReview), "deleteReview");
