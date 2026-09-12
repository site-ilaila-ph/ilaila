import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient } from "@/lib/infra";
import { badRequestProblem } from "@/lib/responses/problem";
import { mapPrismaError, logAndRethrow, ApiErrorCode } from "@/lib/errors";

export const runtime = "nodejs";

async function getBusinesses(_req: NextRequest) {
  try {
    const db = acquirePrismaClient();
    const data = await db.business.findMany({
      include: { tags: true, createdBy: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    logAndRethrow("Management business read", error);
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
    return mapPrismaError(req, error, {
      idRequiredCode: "BUSINESS_ID_REQUIRED" as ApiErrorCode,
      notFoundCode: "BUSINESS_NOT_FOUND" as ApiErrorCode,
      conflictCode: "BUSINESS_CONFLICT" as ApiErrorCode,
      invalidRefCode: "BUSINESS_INVALID_REFERENCE" as ApiErrorCode,
    });
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
    return mapPrismaError(req, error, {
      idRequiredCode: "BUSINESS_ID_REQUIRED" as ApiErrorCode,
      notFoundCode: "BUSINESS_NOT_FOUND" as ApiErrorCode,
      conflictCode: "BUSINESS_CONFLICT" as ApiErrorCode,
      invalidRefCode: "BUSINESS_INVALID_REFERENCE" as ApiErrorCode,
    });
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
    return mapPrismaError(req, error, {
      idRequiredCode: "BUSINESS_ID_REQUIRED" as ApiErrorCode,
      notFoundCode: "BUSINESS_NOT_FOUND" as ApiErrorCode,
      conflictCode: "BUSINESS_CONFLICT" as ApiErrorCode,
      invalidRefCode: "BUSINESS_INVALID_REFERENCE" as ApiErrorCode,
    });
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getBusinesses), "getBusinesses");

export const POST = withLogging(withUnhandledApiErrorHandling(postBusiness), "postBusiness");

export const PATCH = withLogging(withUnhandledApiErrorHandling(patchBusiness), "patchBusiness");

export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteBusiness), "deleteBusiness");
