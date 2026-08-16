/* eslint-disable @typescript-eslint/no-explicit-any */
import z from "zod";
import { ServerError } from "./errors";

// --- Protocol Types ---

export type ActionSuccess<TData> = {
  success: true;
  data: TData;
};

export type ActionValidationErrors = Record<string, string[] | undefined>;

export type ValidationActionFailure = {
    success: false,
    type: "validation",
    fieldErrors: ActionValidationErrors;
};

export type SensitiveActionFailure = {
    success: false,
    type: "sensitive",
    hint?: string;
}

export type InsensitiveActionFailure = {
    success: false; 
    type: "insensitive",
    hint?: string;
    message?: string;
}

export type ActionFailure = ValidationActionFailure | SensitiveActionFailure | InsensitiveActionFailure;
export type ActionResponse<TData> = ActionSuccess<TData> | ActionFailure;

// --- Service & Action Types ---
export type AnySerializablePrimitive = string | number | boolean | null;
export type AnySerializable = AnySerializablePrimitive | AnySerializable[] | { [key: string]: AnySerializable };
export type AnyParameterSchema = z.ZodType<Record<string, AnySerializable>>;

export type AsyncServiceFunction<TParams = any, TReturn = any, TDeps = any> = (
  params: TParams,
  deps: TDeps
) => Promise<TReturn>;

export type AnyAsyncServiceFunction = AsyncServiceFunction<any, any, any>

export type ServerActionBusinessConstraint<TParams, TDeps = any> = (
  params: TParams,
  deps: TDeps
) => void | Promise<void>;

export type AnyServiceActionBusinessConstraint = ServerActionBusinessConstraint<any, any>;

export interface DependencyBuilder<TAccumulated> {
  extend<TAdditional>(
    fn: (accumulated: TAccumulated) => TAdditional
  ): DependencyBuilder<Omit<TAccumulated, keyof TAdditional> & TAdditional>;
  build(): TAccumulated;
}

export interface ServiceFunctionToServerActionOptions<
  TFn extends AsyncServiceFunction,
  TSchema extends z.ZodType<Parameters<TFn>[0]>,
  TDeps = Parameters<TFn>[1]
> {
  serviceFn: TFn;
  schema: TSchema;
  constraints?: ServerActionBusinessConstraint<Parameters<TFn>[0], TDeps>[];
  dependencies?: TDeps | DependencyBuilder<TDeps>;
}

export type AnyServiceFunctionToServerActionOptions = ServiceFunctionToServerActionOptions<AnyAsyncServiceFunction, AnyParameterSchema>;

export interface FunctionCoercedServerAction<
  TFn extends AnyAsyncServiceFunction,
  TSchema extends z.ZodType<Parameters<TFn>[0]>
> {
  (
    input: z.input<TSchema>
  ): Promise<ActionResponse<Awaited<ReturnType<TFn>>>>
}

export type AnyFunctionCoercedServerAction = FunctionCoercedServerAction<AnyAsyncServiceFunction, AnyParameterSchema>;

export type InferFunctionCoercedServerActionResultData<TFn extends AnyFunctionCoercedServerAction> = Exclude<Awaited<ReturnType<TFn>>, ActionFailure>['data'];
// --- Implementation ---

export default function toServerAction<
  TFn extends AsyncServiceFunction,
  TSchema extends z.ZodType<Parameters<TFn>[0]>,
  TDeps = Parameters<TFn>[1]
>(
  options: ServiceFunctionToServerActionOptions<TFn, TSchema, TDeps>
): FunctionCoercedServerAction<TFn, TSchema> {
  const { serviceFn, schema, constraints = [], dependencies } = options;

  return async (
    input: z.input<TSchema>
  ): Promise<ActionResponse<Awaited<ReturnType<TFn>>>> => {
    // 1. Validate Input with Zod
    const parsed = await schema.safeParseAsync(input);

    if (!parsed.success) {
      return {
        success: false,
        type: "validation",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const validParams = parsed.data as Parameters<TFn>[0];

    // Resolve dependencies
    let resolvedDeps: any = undefined;
    if (dependencies) {
      if (typeof dependencies === "object" && dependencies !== null && "build" in dependencies && typeof (dependencies as any).build === "function") {
        resolvedDeps = (dependencies as DependencyBuilder<any>).build();
      } else if (typeof dependencies === "function") {
        resolvedDeps = (dependencies as any)();
      } else {
        resolvedDeps = dependencies;
      }
    }

    try {
      for (const constraint of constraints) {
        await constraint(validParams, resolvedDeps);
      }

      const data = await serviceFn(validParams, resolvedDeps);

      return {
        success: true,
        data: data as Awaited<ReturnType<TFn>>,
      };
    } catch (error: unknown) {
        if (!(error instanceof ServerError)) {
            return {
                success: false,
                type: 'sensitive',
                hint: 'unknown'
            }
        }

        if (error.sensitive) {
            return {
                success: false,
                type: 'sensitive',
                
                hint: error.hint
            };
        }

        return {
            success: false,
            type: 'insensitive',
            hint: error.hint,
            message: error.message
        }
    }
  };
}