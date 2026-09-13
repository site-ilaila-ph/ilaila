import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { mapPrismaError, ApiErrorCode } from "@/lib/errors";
import { acquirePrismaClient } from "@/lib/infra";
import { withLogging } from "@/lib/logging";
import { NextRequest, NextResponse } from "next/server";

// add a food with no relation.
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

export const POST = withLogging(withUnhandledApiErrorHandling(postFood), "postFood");