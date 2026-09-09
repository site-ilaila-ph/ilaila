/* eslint-disable @typescript-eslint/no-explicit-any */
import z from "zod";
import type { AnySerializable } from "../serializable";
import type { ActionFailure, ActionResponse, ActionValidationErrors } from "../common-server-action-protocol";

// --- Service & action types -------------------------------------------------

type AnyParameterSchema = z.ZodType<Record<string, AnySerializable>>;

type AsyncServiceFunction<TParams = any, TReturn = any, TDeps = any> = (
  params: TParams,
  deps: TDeps
) => Promise<TReturn>;

type AnyAsyncServiceFunction = AsyncServiceFunction<any, any, any>;

// --- Constraint violation reporting -----------------------------------------

interface ConstraintViolation {
  field?: string;
  hint?: string;
  message: string;
}

interface ConstraintApi {
  report(violation: ConstraintViolation): void;
  fail(violation: ConstraintViolation): never;
}

class ConstraintFailSignal extends Error {
  constructor() {
    super("constraint fail-fast");
    this.name = "ConstraintFailSignal";
    Object.setPrototypeOf(this, ConstraintFailSignal.prototype);
  }
}

function createConstraintApi(violations: ConstraintViolation[]): ConstraintApi {
  return {
    report(violation) {
      violations.push(violation);
    },
    fail(violation): never {
      violations.push(violation);
      throw new ConstraintFailSignal();
    },
  };
}

function violationsToFieldErrors(violations: ConstraintViolation[]): ActionValidationErrors {
  const fieldErrors: ActionValidationErrors = {};
  for (const violation of violations) {
    if (violation.field === undefined) continue;
    (fieldErrors[violation.field] ??= []).push(violation.message);
  }
  return fieldErrors;
}

function violationsToGlobalErrors(violations: ConstraintViolation[]): string[] {
  return violations.filter((v) => v.field === undefined).map((v) => v.message);
}

type ServerActionBusinessConstraint<TParams, TDeps = any> = (
  params: TParams,
  deps: TDeps,
  api: ConstraintApi
) => void | Promise<void>;

type AnyServerActionBusinessConstraint = ServerActionBusinessConstraint<any, any>;

interface ServiceFunctionToServerActionOptions<
  TFn extends AsyncServiceFunction,
  TSchema extends z.ZodType<Parameters<TFn>[0]>,
  TDeps = Parameters<TFn>[1],
> {
  serviceFn: TFn;
  schema: TSchema;
  constraints?: ServerActionBusinessConstraint<Parameters<TFn>[0], TDeps>[];
  dependencies?: TDeps | (() => TDeps | Promise<TDeps>);
}

type AnyServiceFunctionToServerActionOptions = ServiceFunctionToServerActionOptions<
  AnyAsyncServiceFunction,
  AnyParameterSchema
>;

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

// --- Implementation ----------------------------------------------------------

function toServerAction<
  TFn extends AsyncServiceFunction,
  TSchema extends z.ZodType<Parameters<TFn>[0]>,
  TDeps = Parameters<TFn>[1],
>(
  options: ServiceFunctionToServerActionOptions<TFn, TSchema, TDeps>
): FunctionCoercedServerAction<TFn, TSchema> {
  const { serviceFn, schema, constraints = [], dependencies } = options;

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

    const resolvedDeps: TDeps | undefined =
      typeof dependencies === "function"
        ? await (dependencies as () => TDeps | Promise<TDeps>)()
        : dependencies;

    const violations: ConstraintViolation[] = [];
    const constraintApi = createConstraintApi(violations);

    try {
      for (const constraint of constraints) {
        await constraint(validParams, resolvedDeps as TDeps, constraintApi);
      }
    } catch (error: any) {
      if (!(error instanceof ConstraintFailSignal)) {
        throw error;
      }
    }

    if (violations.length > 0) {
      return {
        success: false,
        type: "constraint",
        fieldErrors: violationsToFieldErrors(violations),
        globalErrors: violationsToGlobalErrors(violations),
      };
    }

    try {
      const data = await serviceFn(validParams, resolvedDeps);

      return {
        success: true,
        data: data as Awaited<ReturnType<TFn>>,
      };
    } catch (error: any) {
      if (!(error instanceof ServerError)) {
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
          hint: error.hint,
        };
      }

      return {
        success: false,
        type: "insensitive",
        hint: error.hint,
        message: error.message,
      };
    }
  };
}

interface ServerErrorOptions {
  domain: string;
  hint?: string;
  message: string;
  sensitive?: boolean;
}

class ServerError extends Error {
  public readonly domain: string;
  public readonly hint?: string;
  public readonly sensitive: boolean;

  public constructor({ domain, hint, message, sensitive = true }: ServerErrorOptions) {
    super(message);

    this.name = "ServerError";
    this.domain = domain;
    this.hint = hint;
    this.sensitive = sensitive;

    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

export { toServerAction, ServerError };

export type {
  AnyParameterSchema,
  AsyncServiceFunction,
  AnyAsyncServiceFunction,
  ServerActionBusinessConstraint,
  AnyServerActionBusinessConstraint,
  ServiceFunctionToServerActionOptions,
  AnyServiceFunctionToServerActionOptions,
  FunctionCoercedServerAction,
  AnyFunctionCoercedServerAction,
  InferFunctionCoercedServerActionResultData,
  ServerErrorOptions,
  ConstraintViolation,
  ConstraintApi,
};
