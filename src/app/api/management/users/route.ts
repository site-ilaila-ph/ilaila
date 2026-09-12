import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient } from "@/lib/infra";
import { badRequestProblem } from "@/lib/responses/problem";
import { mapPrismaError, logAndRethrow, ApiErrorCode } from "@/lib/errors";

export const runtime = "nodejs";

async function getUsers() {
  try {
    const db = acquirePrismaClient();
    const data = await db.userData.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(
      data.map((row) => ({ ...row, isAdmin: row.role === "admin" })),
      { status: 200 },
    );
  } catch (error: unknown) {
    logAndRethrow("Management user read", error);
  }
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
    return mapPrismaError(req, error, {
      idRequiredCode: "USER_ID_REQUIRED" as ApiErrorCode,
      notFoundCode: "USER_NOT_FOUND" as ApiErrorCode,
      conflictCode: "USER_CONFLICT" as ApiErrorCode,
      invalidRefCode: "USER_INVALID_REFERENCE" as ApiErrorCode,
    });
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
    return mapPrismaError(req, error, {
      idRequiredCode: "USER_ID_REQUIRED" as ApiErrorCode,
      notFoundCode: "USER_NOT_FOUND" as ApiErrorCode,
      conflictCode: "USER_CONFLICT" as ApiErrorCode,
      invalidRefCode: "USER_INVALID_REFERENCE" as ApiErrorCode,
    });
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getUsers), "getUsers");

export const PATCH = withLogging(withUnhandledApiErrorHandling(patchUser), "patchUser");

export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteUser), "deleteUser");
