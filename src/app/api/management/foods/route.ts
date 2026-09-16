import { withDomainErrorBoundary } from "@/lib/api/boundary";
import { withLogging } from "@/lib/logging";
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/api/domain-errors";
import { listFoodsService, createSimpleFoodService } from "@/services/food-service";
import { sortableFields, filterableFields, includeableRelations } from "@/repositories/food-repository";
import { parseListOptions, ListOptionsError } from "@/lib/api/list-options";

async function getFoods(req: NextRequest) {
  try {
    const options = parseListOptions(
      req.nextUrl.searchParams,
      sortableFields,
      filterableFields,
      includeableRelations,
    );
    const data = await listFoodsService(options);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    if (err instanceof ListOptionsError) {
      throw new ValidationError({ code: "bad-list-options", detail: err.message });
    }
    throw err;
  }
}

async function postFood(req: NextRequest) {
  const body = await req.json();
  const data = await createSimpleFoodService({
    name: body.name,
    description: body.description,
    history: body.history,
    preparation: body.preparation,
    recipe: body.recipe,
    culturalSignificance: body.culturalSignificance,
    isHeritage: body.isHeritage,
  });
  return NextResponse.json(data, { status: 201 });
}

export const GET = withLogging(withDomainErrorBoundary(getFoods), "getFoods");
export const POST = withLogging(withDomainErrorBoundary(postFood), "postFood");