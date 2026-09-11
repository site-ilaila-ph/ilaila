import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { Prisma } from "@/generated/prisma/client";
import { acquirePrismaClient } from "@/lib/infra";
import {
  badRequestProblem,
  conflictProblem,
  internalErrorProblem,
  notFoundProblem,
} from "@/lib/responses/problem";

export const runtime = "nodejs";

function mapManagementUserFailure(request: NextRequest, error: unknown, action: string): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem(request, { detail: "The request body must be valid JSON." });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return notFoundProblem(request, { code: "user-not-found", detail: "The user does not exist." });
    }

    if (error.code === "P2002") {
      return conflictProblem(request, { code: "user-conflict", detail: "The user already exists." });
    }

    if (error.code === "P2003") {
      return badRequestProblem(
        request,
        {
          code: "user-invalid-reference",
          detail: "The user references a record that does not exist.",
        });
    }
  }

  if (
    error instanceof Prisma.PrismaClientValidationError &&
    /Argument `id` is missing/i.test(error.message)
  ) {
    return badRequestProblem(request, { code: "user-id-required", detail: "A user id is required." });
  }

  console.error(`Management user ${action} failed`, error);
  return internalErrorProblem(request, { detail: `Unable to ${action} the user right now. Please try again later.` });
}

function mapManagementUserReadFailure(request: NextRequest, error: unknown): NextResponse {
  console.error("Management user read failed", error);
  return internalErrorProblem(request, { detail: "Unable to load users right now. Please try again later." });
}
async function getUsers(req: NextRequest) {
  try {
    const db = acquirePrismaClient();
    const data = await db.userData.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(
      data.map((row) => ({ ...row, isAdmin: row.role === "admin" })),
      { status: 200 },
    );
  } catch (error: unknown) {
    return mapManagementUserReadFailure(req, error);
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
    return mapManagementUserFailure(req, error, "update");
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
    return mapManagementUserFailure(req, error, "delete");
  }
}

export const GET = withLogging(getUsers, {
  name: "getUsers",
  redact: { headers: ["authorization", "cookie"] },
});

export const PATCH = withLogging(patchUser, {
  name: "patchUser",
  redact: { headers: ["authorization", "cookie"] },
});

export const DELETE = withLogging(deleteUser, {
  name: "deleteUser",
  redact: { headers: ["authorization", "cookie"] },
});
