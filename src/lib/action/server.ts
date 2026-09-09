/* eslint-disable @typescript-eslint/no-explicit-any */
import z from "zod";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/client";
import type { AnySerializable } from "../serializable";
import type { ActionFailure, ActionResponse, ActionValidationErrors } from "../common-server-action-protocol";

// --- Service & action types -------------------------------------------------

type AnyParameterSchema = z.ZodType<Record<string, AnySerializable>>;

type AsyncServiceFunction<TParams = any, TReturn = any> = (
  params: TParams
) => Promise<TReturn>;

type AnyAsyncServiceFunction = AsyncServiceFunction<any, any>;

interface FunctionCoercedServerAction<
  TFn extends AnyAsyncServiceFunction,
  TSchema extends z.ZodType<Parameters<TFn>[0]>,
> {
  (input: z.input<TSchema>): Promise<ActionResponse<Awaited<ReturnType<TFn>>>>;
}

type AnyFunctionCoercedServerAction = FunctionCoercedServerAction<
  AnyAsyncServiceFunction,
  AnyParameterSchema
>;

type InferFunctionCoercedServerActionResultData<
  TFn extends AnyFunctionCoercedServerAction,
> = Exclude<Awaited<ReturnType<TFn>>, ActionFailure>["data"];

function prismaErrorToActionFailure(error: unknown): ActionFailure | null {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        success: false,
        type: "insensitive",
        hint: "unique-constraint",
        message: "This value is already in use.",
      };
    }

    if (error.code === "P2025") {
      return {
        success: false,
        type: "insensitive",
        hint: "record-not-found",
        message: "The requested record could not be found.",
      };
    }

    return {
      success: false,
      type: "sensitive",
      hint: "database-request",
    };
  }

  if (error instanceof PrismaClientValidationError) {
    return {
      success: false,
      type: "sensitive",
      hint: "database-validation",
    };
  }

  if (error instanceof PrismaClientInitializationError) {
    return {
      success: false,
      type: "sensitive",
      hint: "database-initialization",
    };
  }

  if (error instanceof PrismaClientUnknownRequestError) {
    return {
      success: false,
      type: "sensitive",
      hint: "database-unknown-request",
    };
  }

  if (error instanceof PrismaClientRustPanicError) {
    return {
      success: false,
      type: "sensitive",
      hint: "database-engine",
    };
  }

  return null;
}

// --- Implementation ----------------------------------------------------------

/**
 * Wraps a plain async service function into a schema-validated server action.
 * Takes its dependencies directly as positional arguments rather than a
 * config/options object.
 */
function actionify<
  TFn extends AsyncServiceFunction,
  TSchema extends z.ZodType<Parameters<TFn>[0]>,
>(
  serviceFn: TFn,
  schema: TSchema
): FunctionCoercedServerAction<TFn, TSchema> {
  return async (input: z.input<TSchema>): Promise<ActionResponse<Awaited<ReturnType<TFn>>>> => {
    const parsed = await schema.safeParseAsync(input);

    if (!parsed.success) {
      return {
        success: false,
        type: "validation",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const validParams = parsed.data as Parameters<TFn>[0];

    try {
      const data = await serviceFn(validParams);

      return {
        success: true,
        data: data as Awaited<ReturnType<TFn>>,
      };
    } catch (error: any) {
      const prismaFailure = prismaErrorToActionFailure(error);
      if (prismaFailure) return prismaFailure;

      if (!(error instanceof ApplicationError)) {
        return {
          success: false,
          type: "sensitive",
          hint: "unknown",
        };
      }

      if (error.sensitive) {
        return {
          success: false,
          type: "sensitive",
          hint: error.code ?? "unknown",
        };
      }

      return {
        success: false,
        type: "insensitive",
        hint: error.code ?? "unknown",
        message: error.message,
      };
    }
  };
}

/**
 * A "known" ApplicationError carries a `code` identifying the specific error
 * condition (e.g. "insufficient-funds"). An "unknown" one omits `code` — it's
 * still an intentionally-thrown application error, just not one the caller
 * needs to distinguish by type.
 *
 * `sensitive` controls whether `message` is safe to surface to the client:
 * sensitive errors are swallowed (only a generic hint is returned), while
 * insensitive errors return their message as-is.
 */
interface ApplicationErrorOptions {
  code?: string;
  message: string;
  sensitive?: boolean;
}

class ApplicationError extends Error {
  public readonly code?: string;
  public readonly sensitive: boolean;

  public constructor({ code, message, sensitive = true }: ApplicationErrorOptions) {
    super(message);

    this.name = "ApplicationError";
    this.code = code;
    this.sensitive = sensitive;

    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}

export { actionify, ApplicationError };

export type {
  AnyParameterSchema,
  AsyncServiceFunction,
  AnyAsyncServiceFunction,
  FunctionCoercedServerAction,
  AnyFunctionCoercedServerAction,
  InferFunctionCoercedServerActionResultData,
  ApplicationErrorOptions,
};