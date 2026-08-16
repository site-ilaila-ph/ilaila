import { describe, expect, it } from "vitest";
import z from "zod";
import toServerAction from "@/lib/server/actions";
import { dependencies } from "@/lib/server/di";

describe("toServerAction with Dependency Injection", () => {
  it("supports service functions taking params and deps via dependency builder", async () => {
    const schema = z.object({
      name: z.string(),
    });

    const depsBuilder = dependencies().extend(() => ({
      greeting: "Hello",
    }));

    const serviceFn = async (
      params: { name: string },
      deps: { greeting: string }
    ) => {
      return `${deps.greeting}, ${params.name}!`;
    };

    const action = toServerAction({
      serviceFn,
      schema,
      dependencies: depsBuilder,
    });

    const result = await action({ name: "Alice" });

    expect(result).toEqual({
      success: true,
      data: "Hello, Alice!",
    });
  });

  it("supports service functions with direct deps object or factory function", async () => {
    const schema = z.object({
      value: z.number(),
    });

    const serviceFn = async (
      params: { value: number },
      deps: { multiplier: number }
    ) => {
      return params.value * deps.multiplier;
    };

    const action = toServerAction({
      serviceFn,
      schema,
      dependencies: () => ({ multiplier: 10 }),
    });

    const result = await action({ value: 5 });

    expect(result).toEqual({
      success: true,
      data: 50,
    });
  });
});
