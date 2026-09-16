import { acquirePrismaClient } from "@/lib/infra";
import type { ListOptions, SortableFields, FilterableFields, IncludeList } from "@/lib/api/list-options";
import type { Prisma } from "@/generated/prisma/client";

export const sortableFields: SortableFields = [
  "name",
  "createdAt",
  "updatedAt",
  "isPublished",
  "address",
  "latitude",
  "longitude",
];

export const filterableFields: FilterableFields = {
  name: "string",
  isPublished: "boolean",
  address: "string",
  latitude: "number",
  longitude: "number",
  createdAt: "date",
  updatedAt: "date",
};

export const includeableRelations: IncludeList = [
  "images",
  "tags",
  "reviews",
  "menuItems",
  "foods",
];

const defaultIncludes: IncludeList = [
  "images",
  "tags",
  "reviews",
  "menuItems",
  "foods",
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
): Prisma.BusinessOrderByWithRelationInput | Prisma.BusinessOrderByWithRelationInput[] | undefined {
  if (options.sort.length === 0) {
    return undefined;
  }

  if (options.sort.length === 1) {
    return {
      [options.sort[0].field]: options.sort[0].direction,
    } as Prisma.BusinessOrderByWithRelationInput;
  }

  return options.sort.map((s) => ({
    [s.field]: s.direction,
  })) as Prisma.BusinessOrderByWithRelationInput[];
}

function buildBusinessInclude(include: IncludeList): Prisma.BusinessInclude | undefined {
  const effective = include.length > 0 ? include : defaultIncludes;

  const result: Prisma.BusinessInclude = {};
  for (const rel of effective) {
    switch (rel) {
      case "images":
        result.images = true;
        break;
      case "reviews":
        result.reviews = true;
        break;
      case "menuItems":
        result.menuItems = true;
        break;
      case "foods":
        result.foods = { include: { food: { include: { images: true } } } };
        break;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export async function listBusinesses(
  options: ListOptions,
  opts?: { includeUnpublished?: boolean },
) {
  const db = acquirePrismaClient();

  const where: Prisma.BusinessWhereInput | undefined = options.filter.length > 0
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
            [f.field]: entry as Prisma.BusinessWhereInput[Extract<keyof Prisma.BusinessWhereInput, string>],
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

    const baseWhere: Prisma.BusinessWhereInput = opts?.includeUnpublished
    ? {}
    : { isPublished: true };

  return db.business.findMany({
    where: {
      ...baseWhere,
      ...where,
    },
    orderBy,
    take,
    skip,
    include: buildBusinessInclude(options.include),
  });
}
