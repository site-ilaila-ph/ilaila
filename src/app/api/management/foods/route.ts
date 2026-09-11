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

function isMissingId(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientValidationError &&
    /Argument `id` is missing/i.test(error.message)
  );
}

function mapManagementFoodFailure(request: NextRequest, error: unknown, action: string): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem(request, { detail: "The request body must be valid JSON." });
  }

  if (isMissingId(error)) {
    return badRequestProblem(request, { code: "food-id-required", detail: "A food id is required." });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return notFoundProblem(request, { code: "food-not-found", detail: "The food does not exist." });
    }

    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : undefined;
      return conflictProblem(
        request,
        {
          code: "food-conflict",
          detail: target ? `A food with the same ${target} already exists.` : "The food already exists.",
        });
    }

    if (error.code === "P2003") {
      return badRequestProblem(
        request,
        {
          code: "food-invalid-reference",
          detail: "The food references a record that does not exist.",
        });
    }
  }

  console.error(`Management food ${action} failed`, error);
  return internalErrorProblem(request, { detail: `Unable to ${action} the food right now. Please try again later.` });
}
async function getFoods(req: NextRequest) {
  try {
    const db = acquirePrismaClient();
    const data = await db.food.findMany({
      include: { tags: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("Management food read failed", error);
    return internalErrorProblem(req, { detail: "Unable to load foods right now. Please try again later." });
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
    return mapManagementFoodFailure(req, error, "create");
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
    return mapManagementFoodFailure(req, error, "update");
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
    return mapManagementFoodFailure(req, error, "delete");
  }
}

export const GET = withLogging(getFoods, {
  name: "getFoods",
  redact: { headers: ["authorization", "cookie"] },
});

export const POST = withLogging(postFood, {
  name: "postFood",
  redact: { headers: ["authorization", "cookie"] },
});

export const PATCH = withLogging(patchFood, {
  name: "patchFood",
  redact: { headers: ["authorization", "cookie"] },
});

export const DELETE = withLogging(deleteFood, {
  name: "deleteFood",
  redact: { headers: ["authorization", "cookie"] },
});
