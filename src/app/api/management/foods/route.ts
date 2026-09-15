import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { Prisma } from "@/generated/prisma/client";
import { acquirePrismaClient } from "@/lib/infra";
import { withLogging } from "@/lib/logging";
import { NextRequest, NextResponse } from "next/server";
import {
  badRequestProblem,
  conflictProblem,
  notFoundProblem,
} from "@/lib/api/responses";
import { ListOptionsError, parseListOptions } from "@/lib/api/list-options";
import {
  listFoods,
  sortableFields,
  filterableFields,
  includeableRelations,
} from "@/lib/repos/food";

async function getFoods(req: NextRequest) {
  try {
    const options = parseListOptions(
      req.nextUrl.searchParams,
      sortableFields,
      filterableFields,
      includeableRelations,
    );
    const data = await listFoods(options);
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
        code: "food-not-found",
        title: "Hindi Nakita",
        detail: "Ang pagkain ay hindi umiiral.",
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return conflictProblem(req, {
        code: "food-conflict",
        title: "Salungatan",
        detail: "Mayroon nang pagkain na may parehong mga field.",
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return badRequestProblem(req, {
        code: "food-invalid-reference",
        title: "Maling Request",
        detail: "Ang pagkain ay nagre-record ng record na hindi umiiral.",
      });
    }

        throw error;
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getFoods), "getFoods");
export const POST = withLogging(withUnhandledApiErrorHandling(postFood), "postFood");