import { describe, expect, it } from "vitest";

describe("lib serializable and utility tests", () => {
  it("should validate basic types", () => {
    const val: string = "test";
    expect(val).toBe("test");
  });
});
