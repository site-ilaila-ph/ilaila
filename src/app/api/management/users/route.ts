import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient } from "@/lib/infra";
import {
  badRequestProblem,
  conflictProblem,
  notFoundProblem,
} from "@/lib/api/responses";

export const runtime = "nodejs";

function mapUserPrismaError(req: NextRequest, error: unknown): NextResponse {
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
      code: "user-not-found",
      title: "Hindi Nakita",
      detail: "Ang user ay hindi umiiral.",
    });
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return conflictProblem(req, {
      code: "user-conflict",
      title: "Salungatan",
      detail: "Ang user ay mayroon na.",
    });
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  ) {
    return badRequestProblem(req, {
      code: "user-invalid-reference",
      title: "Maling Request",
      detail: "Ang user ay nagre-record ng record na hindi umiiral.",
    });
  }

  throw error;
}

async function getUsers() {
  const db = acquirePrismaClient();
  const data = await db.userData.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(
    data.map((row) => ({ ...row, isAdmin: row.role === "admin" })),
    { status: 200 },
  );
}

async function patchUser(req: NextRequest) {
  try {
    const body = await req.json();
    const db = acquirePrismaClient();
    const data = await db.userData.update({
      where: { id: body.userId },
      data: { role: body.isAdmin ? "admin" : "viewer" },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    return mapUserPrismaError(req, error);
  }
}

async function deleteUser(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequestProblem(req, { code: "user-id-required", detail: "A user id is required." });
    const db = acquirePrismaClient();
    await db.userData.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapUserPrismaError(req, error);
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getUsers), "getUsers");

export const PATCH = withLogging(withUnhandledApiErrorHandling(patchUser), "patchUser");

export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteUser), "deleteUser");
