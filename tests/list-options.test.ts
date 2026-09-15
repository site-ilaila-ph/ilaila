import { describe, it, expect } from "vitest";
import {
  parseListOptions,
  type ListOptions,
  type ListOptionsError,
} from "@/lib/api/list-options";

const BUSINESS_SORTABLE = ["name", "createdAt", "isPublished"] as const;
const BUSINESS_FILTERABLE = {
  name: "string",
  isPublished: "boolean",
  createdAt: "date",
} as const;

function makeParams(values: Record<string, string>): URLSearchParams {
  return new URLSearchParams(values);
}

function assertListOptions(
  result: ListOptions,
  expected: {
    sort?: Array<{ field: string; direction: "asc" | "desc" }>;
    filter?: Array<{ field: string; op: string; value: string }>;
    page?: { mode: string; limit?: number; offset?: number; page?: number };
  },
) {
  if (expected.sort !== undefined) {
    expect(result.sort).toEqual(expected.sort);
  } else {
    expect(result.sort).toEqual([]);
  }

  if (expected.filter !== undefined) {
    expect(result.filter).toEqual(expected.filter);
  } else {
    expect(result.filter).toEqual([]);
  }

  if (expected.page !== undefined) {
    expect(result.page).toEqual(expected.page);
  } else {
    expect(result.page).toEqual({ mode: "none" });
  }
}

function expectListOptionsError(
  fn: () => ListOptions,
  expectedParam: string,
): void {
  try {
    fn();
    expect.unreachable("Expected ListOptionsError to be thrown");
  } catch (err) {
    expect(err).toBeInstanceOf(ListOptionsError);
    const le = err as ListOptionsError;
    expect(le.param).toBe(expectedParam);
  }
}

describe("parseListOptions — sorting", () => {
  it("parses a single sort field", () => {
    const result = parseListOptions(
      makeParams({ sorting: "name:asc" }),
      BUSINESS_SORTABLE,
      BUSINESS_FILTERABLE,
    );
    assertListOptions(result, {
      sort: [{ field: "name", direction: "asc" }],
    });
  });

  it("parses multiple sort fields separated by semicolon", () => {
    const result = parseListOptions(
      makeParams({ sorting: "rating:desc;name:asc" }),
      ["rating", "name"],
      {},
    );
    assertListOptions(result, {
      sort: [
        { field: "rating", direction: "desc" },
        { field: "name", direction: "asc" },
      ],
    });
  });

  it("treats direction case-insensitively", () => {
    const result = parseListOptions(
      makeParams({ sorting: "name:DESC" }),
      BUSINESS_SORTABLE,
      BUSINESS_FILTERABLE,
    );
    assertListOptions(result, {
      sort: [{ field: "name", direction: "desc" }],
    });
  });

  it("returns empty sort when sorting param is absent", () => {
    const result = parseListOptions(
      makeParams({}),
      BUSINESS_SORTABLE,
      BUSINESS_FILTERABLE,
    );
    assertListOptions(result, {});
  });

  it("returns empty sort when sorting param is empty string", () => {
    const result = parseListOptions(
      makeParams({ sorting: "" }),
      BUSINESS_SORTABLE,
      BUSINESS_FILTERABLE,
    );
    assertListOptions(result, {});
  });

  it("throws on unknown sort field", () => {
    expectListOptionsError(
      () =>
        parseListOptions(
          makeParams({ sorting: "unknown:asc" }),
          BUSINESS_SORTABLE,
          BUSINESS_FILTERABLE,
        ),
      "sorting",
    );
  });

  it("throws on invalid direction", () => {
    expectListOptionsError(
      () =>
        parseListOptions(
          makeParams({ sorting: "name:left" }),
          BUSINESS_SORTABLE,
          BUSINESS_FILTERABLE,
        ),
      "sorting",
    );
  });
});
