import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/client";
import { describe, expect, it } from "vitest";
import { toServerAction } from "@/lib/action/server";
import z from "zod";

const schema = z.object({ value: z.string() });

function actionThatThrows(error: unknown) {
  return toServerAction({
    schema,
    serviceFn: async (params: { value: string }) => {
      void params;
      throw error;
    },
  });
}

describe("toServerAction Prisma error handling", () => {
  it.each([
    ["unknown request", new PrismaClientUnknownRequestError("unknown", { clientVersion: "test" }), "database-unknown-request"],
    ["initialization", new PrismaClientInitializationError("initialization", "test"), "database-initialization"],
    ["validation", new PrismaClientValidationError("validation", { clientVersion: "test" }), "database-validation"],
    ["engine panic", new PrismaClientRustPanicError("panic", "test"), "database-engine"],
  ])("returns a sensitive response for Prisma %s errors", async (_name, error, hint) => {
    await expect(actionThatThrows(error)({ value: "test" })).resolves.toEqual({
      success: false,
      type: "sensitive",
      hint,
    });
  });

  it("returns a safe response for unique constraint errors", async () => {
    const error = new PrismaClientKnownRequestError("duplicate", {
      code: "P2002",
      clientVersion: "test",
    });

    await expect(actionThatThrows(error)({ value: "test" })).resolves.toEqual({
      success: false,
      type: "insensitive",
      hint: "unique-constraint",
      message: "This value is already in use.",
    });
  });

  it("handles Prisma errors thrown while resolving dependencies", async () => {
    const error = new PrismaClientKnownRequestError("missing", {
      code: "P2025",
      clientVersion: "test",
    });
    const action = toServerAction({
      schema,
      serviceFn: async (params: { value: string }) => {
        void params;
        return "unreachable";
      },
      dependencies: async () => {
        throw error;
      },
    });

    await expect(action({ value: "test" })).resolves.toMatchObject({
      success: false,
      type: "insensitive",
      hint: "record-not-found",
    });
  });
});