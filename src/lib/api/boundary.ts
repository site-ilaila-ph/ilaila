import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { isAuthError } from "@supabase/supabase-js";
import type { AnyRequestHandler } from "../next-types";
import {
  badRequestProblem,
  conflictProblem,
  internalErrorProblem,
  notFoundProblem,
  problemResponse,
  tooManyRequestsProblem,
  unauthorizedProblem,
} from "./responses";
import { DomainError } from "./domain-errors";
import { isMissingIdError } from "./errors";

function problemForDomainError(request: NextRequest, err: DomainError): NextResponse {
  return problemResponse(request, {
    type: `${new URL(request.url).origin}/problems/${err.code}`,
    title: err.title,
    status: err.status,
    detail: err.detail,
    code: err.code,
    instance: request.url,
    ...(err.errors !== undefined ? { errors: err.errors } : {}),
  });
}

function mapKnownRequestError(request: NextRequest, err: Error & { code?: string }): NextResponse | undefined {
  switch ((err as Error & { code?: string }).code) {
    case "P2025":
      return notFoundProblem(request, {
        code: "resource-not-found",
        title: "Hindi Nakita",
        detail: "Ang hinahanap mo ay hindi umiiral.",
      });
    case "P2002":
      return conflictProblem(request, {
        code: "resource-conflict",
        title: "Salungatan",
        detail: "Mayroon na kami niyan.",
      });
    case "P2003":
      return badRequestProblem(request, {
        code: "resource-invalid-reference",
        title: "Maling Request",
        detail: "Ang request ay nagre-reference ng record na hindi umiiral.",
      });
    default:
      return undefined;
  }
}

function mapAuthErrorToProblem(request: NextRequest, err: unknown): NextResponse {
  const status = (err as { status?: number }).status ?? 400;
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

export function toProblemResponse(request: NextRequest, err: unknown): NextResponse {
  if (err instanceof DomainError) {
    return problemForDomainError(request, err);
  }

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

  if (err instanceof Error) {
    const mapped = mapKnownRequestError(request, err);
    if (mapped) return mapped;
  }

  if (err instanceof Error) {
    return internalErrorProblem(request, {
      code: "internal-error",
      title: "Error sa Server",
      detail: "May mali sa pagkakaprogram ng website na ito, pakicontact ang gumawa.",
    });
  }

  if (isAuthError(err)) {
    return mapAuthErrorToProblem(request, err);
  }

  return internalErrorProblem(request, {
    code: "internal-error",
    title: "Error sa Server",
    detail: "May naganap na error sa server. Pakisubukan muli sa ibang pagkakataon.",
  });
}

export function withDomainErrorBoundary(handler: AnyRequestHandler): AnyRequestHandler {
  return async function (request: NextRequest, ctx: unknown): Promise<NextResponse> {
    try {
      return await handler(request, ctx);
    } catch (error) {
      Sentry.captureException(error);
      return toProblemResponse(request, error);
    }
  };
}
