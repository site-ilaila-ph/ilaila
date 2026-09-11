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

function isMissingId(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientValidationError &&
    /Argument `id` is missing/i.test(error.message)
  );
}

function mapManagementBusinessFailure(request: NextRequest, error: unknown, action: string): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem(request, { detail: "The request body must be valid JSON." });
  }

  if (isMissingId(error)) {
    return badRequestProblem(request, { code: "business-id-required", detail: "A business id is required." });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return notFoundProblem(request, { code: "business-not-found", detail: "The business does not exist." });
    }

    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : undefined;
      return conflictProblem(
        request,
        {
          code: "business-conflict",
          detail: target ? `A business with the same ${target} already exists.` : "The business already exists.",
        });
    }

    if (error.code === "P2003") {
      return badRequestProblem(
        request,
        {
          code: "business-invalid-reference",
          detail: "The business references a record that does not exist.",
        });
    }
  }

  console.error(`Management business ${action} failed`, error);
  return internalErrorProblem(request, { detail: `Unable to ${action} the business right now. Please try again later.` });
}
async function getBusinesses(req: NextRequest) {
  try {
    const db = acquirePrismaClient();
    const data = await db.business.findMany({
      include: { tags: true, createdBy: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("Management business read failed", error);
    return internalErrorProblem(req, { detail: "Unable to load businesses right now. Please try again later." });
  }
}

async function postBusiness(req: NextRequest) {
  try {
    const body = await req.json();
    const db = acquirePrismaClient();
    const defaultOwner = await db.userData.findFirst({ select: { id: true } });
    if (!defaultOwner) {
      return badRequestProblem(req, { code: "business-owner-required", detail: "A user profile must exist before a business can be created." });
    }
    const data = await db.business.create({
      data: {
        id: crypto.randomUUID(),
        name: body.name,
        description: body.description,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        hours: body.hours,
        history: body.history,
        createdById: defaultOwner.id,
        isPublished: true,
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return mapManagementBusinessFailure(req, error, "create");
  }
}

async function patchBusiness(req: NextRequest) {
  try {
    const body = await req.json();
    const db = acquirePrismaClient();
    const data = await db.business.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        hours: body.hours,
        history: body.history,
      },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    return mapManagementBusinessFailure(req, error, "update");
  }
}

async function deleteBusiness(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequestProblem(req, { code: "business-id-required", detail: "A business id is required." });
    const db = acquirePrismaClient();
    await db.business.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapManagementBusinessFailure(req, error, "delete");
  }
}

export const GET = withLogging(getBusinesses, {
  name: "getBusinesses",
  redact: { headers: ["authorization", "cookie"] },
});

export const POST = withLogging(postBusiness, {
  name: "postBusiness",
  redact: { headers: ["authorization", "cookie"] },
});

export const PATCH = withLogging(patchBusiness, {
  name: "patchBusiness",
  redact: { headers: ["authorization", "cookie"] },
});

export const DELETE = withLogging(deleteBusiness, {
  name: "deleteBusiness",
  redact: { headers: ["authorization", "cookie"] },
});
