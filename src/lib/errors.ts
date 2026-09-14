import type { AuthError } from "@supabase/supabase-js";
import { Prisma } from "@/generated/prisma/client";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  badRequestProblem,
  conflictProblem,
  internalErrorProblem,
  notFoundProblem,
  tooManyRequestsProblem,
  unauthorizedProblem,
} from "./api/responses";
// ---------------------------------------------------------------------------
// Helper to produce a NextResponse from an error code
// ---------------------------------------------------------------------------

export function problemFromCode(
  request: NextRequest,
  code: ApiErrorCode,
  overrides?: { detail?: string; errors?: Record<string, unknown> },
): NextResponse {
  const def = ApiErrors[code];

  const problemFn = problemFunctionForStatus(def.status);
  return problemFn(request, {
    code: def.code,
    title: def.title,
    detail: overrides?.detail ?? def.detail,
    errors: overrides?.errors,
  });
}

function problemFunctionForStatus(status: number) {
  switch (status) {
    case 400:
      return badRequestProblem;
    case 401:
      return unauthorizedProblem;
    case 404:
      return notFoundProblem;
    case 409:
      return conflictProblem;
    case 429:
      return tooManyRequestsProblem;
    case 500:
    default:
      return internalErrorProblem;
  }
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "__isAuthError" in error &&
    typeof (error as { status?: unknown }).status !== "undefined"
  );
}

export function isMissingIdError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientValidationError &&
    /Argument `id` is missing/i.test(error.message)
  );
}

// ---------------------------------------------------------------------------
// Error mappers – translate caught exceptions into API error codes
// ---------------------------------------------------------------------------

export type ErrorMapper = (request: NextRequest, error: unknown) => NextResponse;

/**
 * Maps a Supabase AuthError to the appropriate API error response.
 */
export function mapAuthError(
  request: NextRequest,
  error: unknown,
  config: {
    genericCode: ApiErrorCode;
    invalidCredentialsCode?: ApiErrorCode;
    invalidCode?: ApiErrorCode;
    rateLimitedCode: ApiErrorCode;
    unavailableCode: ApiErrorCode;
    unavailableDetail: string;
    operationName: string;
    specialMessageCheck?: { pattern: RegExp; code: ApiErrorCode }[];
  },
): NextResponse {
  if (error instanceof SyntaxError) {
    return problemFromCode(request, "INVALID_JSON");
  }

  if (error instanceof TypeError) {
    return problemFromCode(request, "INVALID_URL");
  }

  if (isAuthError(error)) {
    const message = error.message || "Authentication failed.";
    const status = error.status ?? 400;

    if (config.specialMessageCheck) {
      for (const { pattern, code } of config.specialMessageCheck) {
        if (pattern.test(message)) {
          return problemFromCode(request, code, { detail: message });
        }
      }
    }

    if (status === 400) {
      return problemFromCode(request, config.genericCode, { detail: message });
    }

    if (status === 401 && config.invalidCredentialsCode) {
      return problemFromCode(request, config.invalidCredentialsCode, { detail: message });
    }

    if (status === 422 && config.invalidCode) {
      return problemFromCode(request, config.invalidCode, { detail: message });
    }

    if (status === 429) {
      return problemFromCode(request, config.rateLimitedCode, { detail: message });
    }

    if (status >= 500) {
      console.error(`${config.operationName} failed with upstream status`, status, message);
      return problemFromCode(request, config.unavailableCode);
    }

    return problemFromCode(request, config.genericCode, { detail: message });
  }

  throw error;
}

/**
 * Maps a Prisma error to the appropriate API error response.
 */
export function mapPrismaError(
  request: NextRequest,
  error: unknown,
  config: {
    idRequiredCode: ApiErrorCode;
    notFoundCode: ApiErrorCode;
    conflictCode: ApiErrorCode;
    invalidRefCode?: ApiErrorCode;
  },
): NextResponse {
  if (error instanceof SyntaxError) {
    return problemFromCode(request, "INVALID_JSON");
  }

  if (isMissingIdError(error)) {
    return problemFromCode(request, config.idRequiredCode);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return problemFromCode(request, config.notFoundCode);
    }

    if (error.code === "P2002") {
      return problemFromCode(request, config.conflictCode);
    }

    if (error.code === "P2003" && config.invalidRefCode) {
      return problemFromCode(request, config.invalidRefCode);
    }
  }

  throw error;
}