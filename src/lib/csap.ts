// Common Server Action Protocol.

import z from "zod";

type ActionSuccess<TData> = {
  success: true;
  data: TData;
};

type ActionValidationErrors = Record<string, string[] | undefined>;

type ValidationActionFailure = {
  success: false;
  type: "validation";
  fieldErrors: ActionValidationErrors;
};

type GenericActionFailure = {
  success: false;
  type: "generic";
  code?: string;
  message: string;
};

type ActionResponse<TData> = ActionSuccess<TData> | GenericActionFailure | ValidationActionFailure;

export function success<TData>(data: TData): ActionSuccess<TData> {
  return { success: true, data };
}

export function fail(code: string, message: string = "UNKNOWN_FAILURE"): GenericActionFailure {
  return { success: false, type: "generic", code, message };
}

export function validation(
  schema: z.ZodType,
  params: unknown,
): ValidationActionFailure | null {
  const parsed = schema.safeParse(params);
  if (parsed.success) return null;
  return {
    success: false,
    type: "validation",
    fieldErrors: parsed.error.flatten().fieldErrors,
  };
}

export type {
  ActionSuccess,
  ActionValidationErrors,
  ValidationActionFailure,
  ActionResponse,
};
