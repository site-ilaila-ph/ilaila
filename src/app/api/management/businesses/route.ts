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
import { ListOptionsError, parseListOptions } from "@/lib/api/list-options";
import {
  listBusinesses,
  sortableFields,
  filterableFields,
  includeableRelations,
} from "@/lib/repos/business";

export const runtime = "nodejs";

function mapBusinessPrismaError(req: NextRequest, error: unknown): NextResponse {
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
        code: "business-not-found",
        title: "Hindi Nakita",
        detail: "Ang negosyo ay hindi umiiral.",
      });
    }

    if (error.code === "P2002") {
      return conflictProblem(req, {
        code: "business-conflict",
        title: "Salungatan",
        detail: "Mayroon nang negosyo na may parehong mga field.",
      });
    }

    if (error.code === "P2003") {
      return badRequestProblem(req, {
        code: "business-invalid-reference",
        title: "Maling Request",
        detail: "Ang negosyo ay nagre-record ng record na hindi umiiral.",
      });
    }
  }

  throw error;
}

async function getBusinesses(req: NextRequest) {
  try {
    const options = parseListOptions(
      req.nextUrl.searchParams,
      sortableFields,
      filterableFields,
      includeableRelations,
    );
    const data = await listBusinesses(options, { includeUnpublished: true });
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    if (err instanceof ListOptionsError) {
      return badRequestProblem(req, {
        code: "bad-list-options",
        title: "Maling Request",
        detail: err.message,
      });
    }
    throw err;
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
    return mapBusinessPrismaError(req, error);
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
    return mapBusinessPrismaError(req, error);
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
    return mapBusinessPrismaError(req, error);
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getBusinesses), "getBusinesses");

export const POST = withLogging(withUnhandledApiErrorHandling(postBusiness), "postBusiness");

export const PATCH = withLogging(withUnhandledApiErrorHandling(patchBusiness), "patchBusiness");

export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteBusiness), "deleteBusiness");
