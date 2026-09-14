import { NextRequest } from "next/server";
import { AnyRequestHandler } from "./next-types";

function withLogging(
  handler: AnyRequestHandler,
  name: string = handler.name || "anonymous",
): AnyRequestHandler {
  return async (request: NextRequest, context: unknown) => {
    const start = performance.now();

    console.log(`[${name}] ${request.method} ${request.url}`);

    try {
      const response = await handler(request, context);

      const duration = performance.now() - start;

      console.log(
        `[${name}] ${response.status} ${request.method} ${request.url} (${duration.toFixed(2)}ms)`,
      );

      return response;
    } catch (error) {
      const duration = performance.now() - start;

      console.error(
        `[${name}] threw ${request.method} ${request.url} (${duration.toFixed(2)}ms)`,
        error,
      );

      throw error;
    }
  };
}

export { withLogging };