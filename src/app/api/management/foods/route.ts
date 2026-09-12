import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient } from "@/lib/infra";
import { badRequestProblem } from "@/lib/responses/problem";
import { mapPrismaError, logAndRethrow, ApiErrorCode } from "@/lib/errors";

export const runtime = "nodejs";

async function getFoods(_req: NextRequest) {
  try {
    const db = acquirePrismaClient();
    const data = await db.food.findMany({
      include: { tags: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    logAndRethrow("Management food read", error);
  }
}

async function postFood(req: NextRequest) {
  try {
    const body = await req.json();
    const db = acquirePrismaClient();
    const data = await db.food.create({
      data: {
        id: crypto.randomUUID(),
        name: body.name,
        description: body.description,
        history: body.history,
        preparation: body.preparation,
        recipe: body.recipe,
        culturalSignificance: body.culturalSignificance,
        isHeritage: body.isHeritage,
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return mapPrismaError(req, error, {
      idRequiredCode: "FOOD_ID_REQUIRED" as ApiErrorCode,
      notFoundCode: "FOOD_NOT_FOUND" as ApiErrorCode,
      conflictCode: "FOOD_CONFLICT" as ApiErrorCode,
      invalidRefCode: "FOOD_INVALID_REFERENCE" as ApiErrorCode,
    });
  }
}

async function patchFood(req: NextRequest) {
  try {
    const body = await req.json();
    const db = acquirePrismaClient();
    const data = await db.food.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        history: body.history,
        preparation: body.preparation,
        recipe: body.recipe,
        culturalSignificance: body.culturalSignificance,
        isHeritage: body.isHeritage,
      },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    return mapPrismaError(req, error, {
      idRequiredCode: "FOOD_ID_REQUIRED" as ApiErrorCode,
      notFoundCode: "FOOD_NOT_FOUND" as ApiErrorCode,
      conflictCode: "FOOD_CONFLICT" as ApiErrorCode,
      invalidRefCode: "FOOD_INVALID_REFERENCE" as ApiErrorCode,
    });
  }
}

async function deleteFood(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequestProblem(req, { code: "food-id-required", detail: "A food id is required." });
    const db = acquirePrismaClient();
    await db.food.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapPrismaError(req, error, {
      idRequiredCode: "FOOD_ID_REQUIRED" as ApiErrorCode,
      notFoundCode: "FOOD_NOT_FOUND" as ApiErrorCode,
      conflictCode: "FOOD_CONFLICT" as ApiErrorCode,
      invalidRefCode: "FOOD_INVALID_REFERENCE" as ApiErrorCode,
    });
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getFoods), "getFoods");

export const POST = withLogging(withUnhandledApiErrorHandling(postFood), "postFood");

export const PATCH = withLogging(withUnhandledApiErrorHandling(patchFood), "patchFood");

export const DELETE = withLogging(withUnhandledApiErrorHandling(deleteFood), "deleteFood");
