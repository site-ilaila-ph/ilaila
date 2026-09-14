import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { AnyRequestHandler } from "./next-types";
import { badRequestProblem, conflictProblem, internalErrorProblem, notFoundProblem, tooManyRequestsProblem, unauthorizedProblem, unprocessableProblem } from "./api/responses";
import { Prisma } from "@/generated/prisma/client";
import { isAuthError } from "@supabase/supabase-js";

export type ErrorHandlingCallback = (
  request: NextRequest,
  ctx: unknown,
  error: unknown,
) => Promise<NextResponse>;

function withApiErrorHandling(
  handler: AnyRequestHandler,
  onError: ErrorHandlingCallback,
  captureWithSentry = true,
) {
  return async function (request: NextRequest, ctx: unknown): Promise<NextResponse> {
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


export function withUnhandledApiErrorHandling(
  handler: AnyRequestHandler,
): AnyRequestHandler {
  return async (request: NextRequest, ctx: unknown): Promise<NextResponse> => {
    try {
      return await handler(request, ctx);
    } catch (error) {
      Sentry.captureException(error);
      return internalErrorProblem(request);
    }
  };
}

export function isMissingIdError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientValidationError &&
    /Argument `id` is missing/i.test(err.message)
  );
}

export type ErrorDetail = { code: string; title: string; detail: string };

export function logAndRethrow(context: string, err: unknown): never {
  console.error(`${context} failed`, err);
  throw err;
}

export const commonErrorHandler: ErrorHandlingCallback = async (
  request: NextRequest,
  _ctx: unknown,
  err: unknown,
): Promise<NextResponse> => {
  if (err instanceof SyntaxError) {
    return badRequestProblem(request, {
      code: "invalid-json",
      title: "Maling Request",
      detail: "Ang request body ay dapat na valid JSON.",
    });
  }

  if (err instanceof TypeError) {
    return badRequestProblem(request, {
      code: "invalid-url",
      title: "Maling Request",
      detail: "Ang request URL ay hindi wasto.",
    });
  }

  if (isMissingIdError(err)) {
    return badRequestProblem(request, {
      code: "id-required",
      title: "Maling Request",
      detail: "Kinakailangan ng id.",
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2025": // record not found
        return notFoundProblem(request, {
          code: "resource-not-found",
          title: "Hindi Nakita",
          detail: "Ang hinahanap mo ay hindi umiiral.",
        });
      case "P2002": // unique constraint violation
        return conflictProblem(request, {
          code: "resource-conflict",
          title: "Salungatan",
          detail: "Mayroon na kami niyan.",
        });
      case "P2003": // foreign key constraint violation
        return badRequestProblem(request, {
          code: "resource-invalid-reference",
          title: "Maling Request",
          detail: "Ang request ay nagre-reference ng record na hindi umiiral.",
        });
      default:
        break; // fall through to generic 500 below
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    // do not expose what happened.
    return internalErrorProblem(request, {
      code: "internal-error",
      title: "Error sa Server",
      detail:
        "May mali sa pagkakaprogram ng website na ito, pakicontact ang gumawa.",
    });
  }

  if (isAuthError(err)) {
    const status = err.status ?? 400;

    if (status === 401) {
      return unauthorizedProblem(request, {
        code: "unauthorized",
        title: "Hindi Autentificado",
        detail: "Di ka awtorisado.",
      });
    }
    if (status === 400 || status === 422) {
      return badRequestProblem(request, {
        code: "bad-request",
        title: "Maling Request",
        detail: "May mali sa iyong request.",
      });
    }

    if (status === 429) {
      return tooManyRequestsProblem(request, {
        code: "rate-limited",
        title: "Maraming Request",
        detail: "Napakaraming request. Pakisubukan muli sa ibang pagkakataon.",
      });
    }

    if (status >= 500) {
      return internalErrorProblem(request, {
        code: "internal-error",
        title: "Error sa Server",
        detail: "May naganap na error sa server. Pakisubukan muli sa ibang pagkakataon.",
      });
    }

    return badRequestProblem(request, {
      code: "bad-request",
      title: "Maling Request",
      detail: "May mali sa iyong request.",
    });
  }

  return internalErrorProblem(request, {
    code: "internal-error",
    title: "Error sa Server",
    detail: "May naganap na error sa server. Pakisubukan muli sa ibang pagkakataon.",
  });
};

export interface PrismaErrorDetail {
  idRequired: ErrorDetail;
  notFound: ErrorDetail;
  conflict: ErrorDetail;
  invalidRef?: ErrorDetail;
}

export interface PrismaErrorHandlerConfig {
  idRequired: PrismaErrorDetail["idRequired"];
  notFound: PrismaErrorDetail["notFound"];
  conflict: PrismaErrorDetail["conflict"];
  invalidRef?: PrismaErrorDetail["invalidRef"];
}

function mapPrismaKnownError(
  request: NextRequest,
  err: Prisma.PrismaClientKnownRequestError,
  detail: PrismaErrorDetail,
): NextResponse | undefined {
  if (err.code === "P2025") {
    return notFoundProblem(request, detail.notFound);
  }

  if (err.code === "P2002") {
    return conflictProblem(request, detail.conflict);
  }

  if (err.code === "P2003" && detail.invalidRef) {
    return badRequestProblem(request, detail.invalidRef);
  }

  return undefined;
}

export function mapPrismaError(
  request: NextRequest,
  err: unknown,
  config: PrismaErrorHandlerConfig,
): NextResponse {
  if (err instanceof SyntaxError) {
    return badRequestProblem(request, {
      code: "invalid-json",
      title: "Maling Request",
      detail: "Ang request body ay dapat na valid JSON.",
    });
  }

  if (isMissingIdError(err)) {
    return badRequestProblem(request, config.idRequired);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaKnownError(request, err, config);
    if (mapped) return mapped;
  }

  throw err;
}

export function makePrismaErrorHandler(
  config: PrismaErrorHandlerConfig,
): ErrorHandlingCallback {
  return async (request, _ctx, err) => mapPrismaError(request, err, config);
}

export interface AuthErrorDetail {
  generic: ErrorDetail;
  invalidCredentials?: ErrorDetail;
  invalid?: ErrorDetail;
  rateLimited: ErrorDetail;
  unavailable: ErrorDetail;
}

export interface AuthErrorHandlerConfig {
  generic: AuthErrorDetail["generic"];
  invalidCredentials?: AuthErrorDetail["invalidCredentials"];
  invalid?: AuthErrorDetail["invalid"];
  rateLimited: AuthErrorDetail["rateLimited"];
  unavailable: AuthErrorDetail["unavailable"];
  operationName: string;
}

function mapAuthStatusError(
  request: NextRequest,
  status: number,
  message: string,
  detail: AuthErrorDetail,
): NextResponse {
  if (status === 400) {
    return badRequestProblem(request, { ...detail.generic, detail: message });
  }

  if (status === 401 && detail.invalidCredentials) {
    return unauthorizedProblem(request, { ...detail.invalidCredentials, detail: message });
  }

  if (status === 422 && detail.invalid) {
    return unprocessableProblem(request, { ...detail.invalid, detail: message });
  }

  if (status === 429) {
    return tooManyRequestsProblem(request, { ...detail.rateLimited, detail: message });
  }

  if (status >= 500) {
    return internalErrorProblem(request, detail.unavailable);
  }

  return badRequestProblem(request, { ...detail.generic, detail: message });
}

export function mapAuthError(
  request: NextRequest,
  err: unknown,
  config: AuthErrorHandlerConfig,
): NextResponse {

  if (err instanceof SyntaxError) {
    return badRequestProblem(request, {
      code: "invalid-json",
      title: "Maling Request",
      detail: "Ang request body ay dapat na valid JSON.",
    });
  }

  if (err instanceof TypeError) {
    return badRequestProblem(request, {
      code: "invalid-url",
      title: "Maling Request",
      detail: "Ang request URL ay hindi wasto.",
    });
  }

  if (isAuthError(err)) {
    const message = err.message || "Authentication failed.";
    const status = err.status ?? 400;

    if (status >= 500) {
      console.error(
        `${config.operationName} failed with upstream status`,
        status,
        message,
      );
    }

    return mapAuthStatusError(request, status, message, config);
  }

  throw err;
}

export function makeAuthErrorHandler(
  config: AuthErrorHandlerConfig,
): ErrorHandlingCallback {
  return async (request, _ctx, err) => mapAuthError(request, err, config);
}

export { withApiErrorHandling }