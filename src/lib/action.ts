/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof window !== "undefined") {
  throw new Error("A server-only module was imported in the client.");
}

import z from "zod";
import { useCallback, useState, useTransition } from "react";
import type { AnySerializable } from "./serializable";
import type { ActionFailure, ActionResponse, ActionValidationErrors } from "./common-server-action-protocol";


// Server Actions - typed wrapper turning a service function + Zod schema into
// a Next.js server action with validation, dependency injection, and a
// consistent success/failure response shape.

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

interface UseServerActionOptions<TAction extends AnyFunctionCoercedServerAction> {
    action: TAction;
}

interface UseServerActionReturn<TAction extends AnyFunctionCoercedServerAction> {
    execute(params: Parameters<TAction>[0]): Promise<Awaited<ReturnType<TAction>>>;
    executionOngoing: boolean;
    result: Awaited<ReturnType<TAction>> | null;
}

function useServerAction<TAction extends AnyFunctionCoercedServerAction>({ action }: UseServerActionOptions<TAction>): UseServerActionReturn<TAction> {
    type ResultType = UseServerActionReturn<TAction>['result'];
    const [executionOngoing, startExecution] = useTransition();
    const [result, setResult] = useState<ResultType>(null);

    const execute = useCallback((input: Parameters<TAction>[0]) => {
        return new Promise<Awaited<ReturnType<TAction>>>((resolve) => startExecution(async () => {
            const result = await action(input);
            setResult(result as ResultType);
            resolve(result as Awaited<ReturnType<TAction>>);
        }));
    }, [action]);

    return { executionOngoing, result, execute }
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

export { toServerAction, useServerAction, ServerError };

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