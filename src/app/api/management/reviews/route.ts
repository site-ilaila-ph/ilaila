import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient } from "@/lib/infra";
import { badRequestProblem, notFoundProblem } from "@/lib/api/responses";

export const runtime = "nodejs";

async function getReviews() {
  const db = acquirePrismaClient();
  const data = await db.businessReview.findMany({
    include: {
      user: { include: { authUser: true } },
      business: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(data, { status: 200 });
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
    if (error instanceof SyntaxError) {
      return badRequestProblem(req, {
        code: "invalid-json",
        title: "Maling Request",
        detail: "Ang request body ay dapat na valid JSON.",
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return notFoundProblem(req, {
        code: "review-not-found",
        title: "Hindi Nakita",
        detail: "Ang review ay hindi umiiral.",
      });
    }

    throw error;
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getReviews), "getReviews");

export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteReview), "deleteReview");
