import * as Sentry from "@sentry/nextjs";
import { AnyRequestHandler } from "./next-types";
import { internalErrorProblem } from "./responses";
import { NextRequest } from "next/server";

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