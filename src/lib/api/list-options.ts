export type FilterOp = "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "startsWith";

export type FieldType = "string" | "number" | "boolean" | "date";

export type ListOptions = {
  sort: { field: string; direction: "asc" | "desc" }[];
  filter: { field: string; op: FilterOp; value: string }[];
  include: IncludeList;
  page:
    | { mode: "offset"; offset: number; limit: number }
    | { mode: "page"; page: number; limit: number }
    | { mode: "none" };
};

export type SortableFields = ReadonlyArray<string>;
export type FilterableFields = Readonly<Record<string, FieldType>>;
export type IncludeList = ReadonlyArray<string>;

const VALID_DIRECTIONS = new Set<string>(["asc", "desc"]);

const VALID_OPS = new Set<string>([
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "contains",
  "startsWith",
]);

const STRING_OPS = new Set<string>(["eq", "ne", "contains", "startsWith"]);
const NUMBER_OPS = new Set<string>(["eq", "ne", "gt", "gte", "lt", "lte"]);
const BOOLEAN_OPS = new Set<string>(["eq", "ne"]);
const DATE_OPS = new Set<string>(["eq", "ne", "gt", "gte", "lt", "lte"]);

function validOpsForType(type: FieldType): ReadonlySet<string> {
  switch (type) {
    case "string":
      return STRING_OPS;
    case "number":
      return NUMBER_OPS;
    case "boolean":
      return BOOLEAN_OPS;
    case "date":
      return DATE_OPS;
  }
}

export class ListOptionsError extends Error {
  readonly param: string;
  readonly message: string;

  constructor(param: string, message: string) {
    super(message);
    this.name = "ListOptionsError";
    this.param = param;
    this.message = message;
  }
}

function parsePositiveInteger(value: string | null, param: string): number {
  if (value === null || value === "") {
    return NaN;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw new ListOptionsError(param, `Invalid value for "${param}": must be a non-negative integer.`);
  }
  return n;
}

function parseLimit(value: string | null, param: string): number {
  if (value === null || value === "") {
    return NaN;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    throw new ListOptionsError(param, `Invalid value for "${param}": must be a positive integer.`);
  }
  return n;
}

function parseSortEntry(raw: string, allowed: SortableFields): { field: string; direction: "asc" | "desc" } {
  const colonIndex = raw.indexOf(":");
  if (colonIndex <= 0 || colonIndex === raw.length - 1) {
    throw new ListOptionsError("sorting", `Invalid sorting entry "${raw}": expected "field:direction".`);
  }

  const field = raw.slice(0, colonIndex).trim();
  const direction = raw.slice(colonIndex + 1).trim().toLowerCase();

  if (!field) {
    throw new ListOptionsError("sorting", "Invalid sorting entry: field name is required.");
  }

  if (!VALID_DIRECTIONS.has(direction)) {
    throw new ListOptionsError(
      "sorting",
      `Invalid direction "${raw.slice(colonIndex + 1)}" in sorting entry "${raw}": must be "asc" or "desc".`,
    );
  }

  if (!allowed.includes(field)) {
    throw new ListOptionsError(
      "sorting",
      `Unknown sort field "${field}": not in the resource's sortable fields.`,
    );
  }

  return { field, direction: direction as "asc" | "desc" };
}

function parseFilterEntry(
  raw: string,
  allowed: FilterableFields,
): { field: string; op: FilterOp; value: string } {
  const firstColon = raw.indexOf(":");
  if (firstColon <= 0) {
    throw new ListOptionsError(
      "filter",
      `Invalid filter entry "${raw}": expected "field:op:value".`,
    );
  }

  const secondColon = raw.indexOf(":", firstColon + 1);
  if (secondColon < 0) {
    throw new ListOptionsError(
      "filter",
      `Invalid filter entry "${raw}": expected "field:op:value".`,
    );
  }

  const field = raw.slice(0, firstColon).trim();
  const op = raw.slice(firstColon + 1, secondColon).trim().toLowerCase();
  const value = raw.slice(secondColon + 1);

  if (!field) {
    throw new ListOptionsError("filter", "Invalid filter entry: field name is required.");
  }

  if (!VALID_OPS.has(op)) {
    throw new ListOptionsError(
      "filter",
      `Unknown filter operator "${op}" in filter entry "${raw}": supported operators are eq, ne, gt, gte, lt, lte, contains, startsWith.`,
    );
  }

  if (!(field in allowed)) {
    throw new ListOptionsError(
      "filter",
      `Unknown filter field "${field}": not in the resource's filterable fields.`,
    );
  }

  const fieldType = allowed[field];
  const allowedOps = validOpsForType(fieldType);
  if (!allowedOps.has(op)) {
    throw new ListOptionsError(
      "filter",
      `Operator "${op}" is not valid for field "${field}" (type ${fieldType}).`,
    );
  }

  return { field, op: op as FilterOp, value };
}

function parseInclude(raw: string, allowed: IncludeList): IncludeList {
  if (raw.trim() === "") {
    throw new ListOptionsError("include", 'Invalid include param: empty value.');
  }

  const entries = raw.split(/[\;,]/);
  const result: string[] = [];
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (trimmed === "") {
      throw new ListOptionsError(
        "include",
        'Invalid include param: empty entry in list.',
      );
    }
    if (!allowed.includes(trimmed)) {
      throw new ListOptionsError(
        "include",
        `Unknown include relation "${trimmed}": not in the resource's allowed includes.`,
      );
    }
    result.push(trimmed);
  }
  return result;
}

export function parseListOptions(
  searchParams: URLSearchParams,
  sortableFields: SortableFields,
  filterableFields: FilterableFields,
  includeFields: IncludeList,
): ListOptions {
  const sortParam = searchParams.get("sorting");
  const filterParam = searchParams.get("filter");
  const includeParam = searchParams.get("include");
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const pageParam = searchParams.get("page");

  const hasOffset = offsetParam !== null;
  const hasPage = pageParam !== null;

  if (hasOffset && hasPage) {
    throw new ListOptionsError(
      "page",
      'Invalid pagination: both "offset" and "page" are present. Use one style only.',
    );
  }

  let limit: number | undefined;
  let offset = 0;
  let page = 1;

  if (limitParam !== null) {
    limit = parseLimit(limitParam, "limit");
  }

  if (hasOffset) {
    offset = parsePositiveInteger(offsetParam, "offset");
  }

  if (hasPage) {
    page = parsePositiveInteger(pageParam, "page");
  }

  let pageMode: ListOptions["page"] = { mode: "none" as const };

  if (limit !== undefined) {
    if (hasOffset) {
      pageMode = { mode: "offset", offset, limit };
    } else {
      pageMode = { mode: "page", page, limit };
    }
  } else if (hasOffset) {
    throw new ListOptionsError(
      "limit",
      'Invalid pagination: "offset" is present but "limit" is missing. Both are required for offset-style pagination.',
    );
  } else if (hasPage) {
    throw new ListOptionsError(
      "limit",
      'Invalid pagination: "page" is present but "limit" is missing. Both are required for page-style pagination.',
    );
  }

  const sort: ListOptions["sort"] = [];
  if (sortParam !== null && sortParam !== "") {
    const entries = sortParam.split(";");
    for (const raw of entries) {
      if (raw.trim() === "") {
        throw new ListOptionsError(
          "sorting",
          'Invalid sorting param: empty entry in "sorting" list.',
        );
      }
      sort.push(parseSortEntry(raw, sortableFields));
    }
  }

  const filter: ListOptions["filter"] = [];
  if (filterParam !== null && filterParam !== "") {
    const entries = filterParam.split(";");
    for (const raw of entries) {
      if (raw.trim() === "") {
        throw new ListOptionsError(
          "filter",
          'Invalid filter param: empty entry in "filter" list.',
        );
      }
      filter.push(parseFilterEntry(raw, filterableFields));
    }
  }

  const include: IncludeList = includeParam !== null && includeParam !== ""
    ? parseInclude(includeParam, includeFields)
    : [];

  return { sort, filter, include, page: pageMode };
}
