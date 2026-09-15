import { acquirePrismaClient } from "@/lib/infra";
import type { ListOptions, FieldType, SortableFields, FilterableFields, IncludeList } from "@/lib/api/list-options";
import type { Prisma } from "@/generated/prisma/client";

export const sortableFields: SortableFields = [
  "name",
  "isHeritage",
  "culturalSignificance",
  "createdAt",
];

export const filterableFields: FilterableFields = {
  name: "string",
  isHeritage: "boolean",
  culturalSignificance: "string",
  description: "string",
  history: "string",
  preparation: "string",
  recipe: "string",
};

export const includeableRelations: IncludeList = [
  "images",
  "tags",
  "businesses",
];

const defaultIncludes: IncludeList = [
  "images",
  "tags",
];

function filterOpToPrisma(op: string): string {
  switch (op) {
    case "eq":
      return "equals";
    case "ne":
      return "not";
    case "gt":
      return "gt";
    case "gte":
      return "gte";
    case "lt":
      return "lt";
    case "lte":
      return "lte";
    case "contains":
      return "contains";
    case "startsWith":
      return "startsWith";
    default:
      return op;
  }
}

function buildOrderBy(
  options: ListOptions,
): Prisma.FoodOrderByWithRelationInput | Prisma.FoodOrderByWithRelationInput[] | undefined {
  if (options.sort.length === 0) {
    return undefined;
  }

  if (options.sort.length === 1) {
    return {
      [options.sort[0].field]: options.sort[0].direction,
    } as Prisma.FoodOrderByWithRelationInput;
  }

  return options.sort.map((s) => ({
    [s.field]: s.direction,
  })) as Prisma.FoodOrderByWithRelationInput[];
}

function buildFoodInclude(include: IncludeList): Prisma.FoodInclude | undefined {
  const effective = include.length > 0 ? include : defaultIncludes;

  const result: Prisma.FoodInclude = {};
  for (const rel of effective) {
    switch (rel) {
      case "images":
        result.images = true;
        break;
      case "tags":
        result.tags = true;
        break;
      case "businesses":
        result.businesses = { include: { business: { include: { images: true, tags: true } } } };
        break;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export async function listFoods(options: ListOptions) {
  const db = acquirePrismaClient();

  const where: Prisma.FoodWhereInput = options.filter.length > 0
    ? {
        AND: options.filter.map((f) => {
          const prismaOp = filterOpToPrisma(f.op);
          const entry: Record<string, unknown> = {
            [prismaOp]: f.value,
          };
          if (f.op === "contains" || f.op === "startsWith") {
            entry["mode"] = "insensitive";
          }
          return {
            [f.field]: entry as Prisma.FoodWhereInput[Extract<keyof Prisma.FoodWhereInput, string>],
          };
        }),
      }
    : undefined;

  const orderBy = buildOrderBy(options);

  const take =
    options.page.mode === "none" ? undefined : options.page.limit;
  const skip =
    options.page.mode === "none"
      ? undefined
      : options.page.mode === "offset"
        ? options.page.offset
        : (options.page.page - 1) * options.page.limit;

  return db.food.findMany({
    where,
    orderBy,
    take,
    skip,
    include: {
      _count: { select: { businesses: true } },
      ...buildFoodInclude(options.include),
    },
  });
}
