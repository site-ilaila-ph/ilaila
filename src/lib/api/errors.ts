import * as Sentry from "@sentry/nextjs";
import { AnyRequestHandler } from "../next-types";
import { badRequestProblem, conflictProblem, internalErrorProblem, notFoundProblem, ProblemDetails, tooManyRequestsProblem, unauthorizedProblem } from "./responses";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { isAuthError } from "@supabase/supabase-js";
import { problemFromCode, isMissingIdError } from "../errors";
import apiErrors from "@/config/api-errors";

export function withUnhandledApiErrorHandling(
  handler: AnyRequestHandler,
): AnyRequestHandler {
  return async (request: NextRequest, ctx: unknown): Promise<Response> => {
    try {
      return await handler(request, ctx);
    } catch (error) {
      Sentry.captureException(error);
      return internalErrorProblem(request);
    }
  };
}

interface ErrorHandlingCallback {
  (request: NextRequest, ctx: unknown, error: unknown): Promise<NextResponse>;
}

export function withApiErrorHandling(handler: AnyRequestHandler, onError: ErrorHandlingCallback, captureWithSentry: boolean = true) {
  return async function (request: NextRequest, ctx: unknown): Promise<Response> {
    try {
      return await handler(request, ctx);
    } catch (error) {
      if (captureWithSentry) {
        Sentry.captureException(error);
      }

      const res = await onError(request, ctx, error);
      return res;
    }
  }
}

/**
 * Generic, resource-agnostic error handling. Use this as the fallback
 * `onError` for withApiErrorHandling on routes that haven't (or can't)
 * do resource-specific mapPrismaError/mapAuthError mapping. Order matters:
 * most specific / most informative checks first, generic 500 last.
 */
export const commonErrorHandler: ErrorHandlingCallback = async (
  request: NextRequest,
  _ctx: unknown,
  error: unknown,
): Promise<NextResponse> => {
  if (error instanceof SyntaxError) {
    return problemFromCode(request, "INVALID_JSON");
  }

  if (isMissingIdError(error)) {
    return problemFromCode(request, "ID_REQUIRED");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2025": // record not found
        return notFoundProblem(request, {
          detail: "Wala saamin ang hinigingi mo.",
        });
      case "P2002": // unique constraint violation
        return conflictProblem(request, {
          detail: "Mayroon na kami niyan.",
        });
      case "P2003": // foreign key constraint violation
        return internalErrorProblem(request, {
          detail: "May kababalaghang nangyayare sa data namin. Pakicontact ang nagpapanatili ng website na ito.",
        });
      default:
        break; // fall through to generic 500 below
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    // do not expose what happened.
    return internalErrorProblem(request, { detail: "May mali sa pagkakaprogram ng website na ito, pakicontact ang gumawa." });
  }

  if (isAuthError(error)) {
    const status = error.status ?? 400;

    if (status === 401) {
      return unauthorizedProblem(request, { detail: "Di ka awtorisado." });
    }
    if (status === 400 || status === 422) {
      return badRequestProblem(request, { detail: "May mali sa iyong request." });
    }

    if (status === 429) {
      return tooManyRequestsProblem(request, 
        { detail: "Masyado ka nang humihingi, huminahon ka muna." }
      )
    }

    return internalErrorProblem(request);
  }

  return internalErrorProblem(request);
};

export const error = function <TInternalName extends keyof typeof apiErrors>(
  request: NextRequest,
  name: TInternalName,
): NextResponse<ProblemDetails> {
  return NextResponse.json(
    {
      ...apiErrors[name],
      type: `${request.nextUrl.protocol}//${request.nextUrl.host}/problems/${apiErrors[name].code}`,
      instance: request.nextUrl.pathname,
    },
    {
      status: apiErrors[name].status,
      headers: { "Content-Type": "application/problem+json" },
    },
  );
};

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