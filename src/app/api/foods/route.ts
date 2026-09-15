import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withDomainErrorBoundary } from "@/lib/api/boundary";
import { ValidationError } from "@/lib/api/domain-errors";
import type { Prisma } from "@/generated/prisma/client";
import { ok } from "@/lib/api/responses";
import { parseListOptions, ListOptionsError } from "@/lib/api/list-options";
import { sortableFields, filterableFields, includeableRelations } from "@/lib/repos/food";
import { listFoodsService, createFoodService } from "@/lib/services/food";

async function getFoods(req: NextRequest) {
  try {
    const options = parseListOptions(
      req.nextUrl.searchParams,
      sortableFields,
      filterableFields,
      includeableRelations,
    );
    const data = await listFoodsService(options);
    return ok(data);
  } catch (err) {
    if (err instanceof ListOptionsError) {
      throw new ValidationError({ code: "bad-list-options", detail: err.message });
    }
    throw err;
  }
}

async function createFood(req: NextRequest) {
  const fd = await req.formData();
  const metadataRaw = fd.get("metadata");

  if (typeof metadataRaw !== "string") {
    throw new ValidationError({ code: "metadata-required", detail: "A metadata JSON part is required." });
  }

  let parsed: { food: Prisma.FoodUncheckedCreateInput; images?: Array<Record<string, unknown>> };
  try {
    parsed = JSON.parse(metadataRaw);
  } catch {
    throw new ValidationError({ code: "metadata-invalid-json", detail: "metadata part must be valid JSON." });
  }

  if (!parsed?.food) {
    throw new ValidationError({ code: "food-required", detail: "metadata.food is required." });
  }

  const imageFiles = fd.getAll("images").filter((f): f is File => f instanceof File);
  const imagesMeta = parsed.images ?? [];

  const food = await createFoodService({ foodFields: parsed.food, imagesMeta, imageFiles });

  return ok(food);
}

export const GET = withLogging(withDomainErrorBoundary(getFoods), "getFoods");
export const POST = withLogging(withDomainErrorBoundary(createFood), "createFood");
export type { NextResponse };