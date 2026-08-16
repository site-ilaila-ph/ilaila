/**
 * @file Modular Middleware Pattern for Next.js
 *
 * This module provides a utility to break down Next.js's single global middleware 
 * into smaller, route-specific middleware functions. These self-contained modules 
 * can be evaluated sequentially and composed into a single monolithic Next.js 
 * middleware, enabling better separation of concerns and maintainability.
 */

import {
  NextFetchEvent,
  NextProxy,
  NextRequest,
  NextResponse,
} from "next/server";
import { match, MatchFunction } from "path-to-regexp";

type Params = Record<string, string | string[]>;

interface ApplicationMiddlewareHandler<P extends Params = Params> {
  (
    req: NextRequest,
    event: NextFetchEvent,
    params: P,
  ): Promise<NextResponse | undefined>;
}

interface ApplicationMiddleware<P extends Params = Params> {
  handler: ApplicationMiddlewareHandler<P>;
  matcher: MatchFunction<P>;
}

interface ApplicationMiddlewareOptions {
  paths: string[];
}

type MonolithicMiddleware = NextProxy;

function acquireMiddleware<P extends Params>(
  handler: ApplicationMiddlewareHandler<P>,
  { paths }: ApplicationMiddlewareOptions,
): ApplicationMiddleware<P> {
  const matcher = match<P>(paths);
  return { handler, matcher: (path: string) => matcher(path) };
}

/**
 * Flattens multiple application middlewares into a single Next.js monolithic middleware.
 * The function returned by this function executes all middlewares in
 * sequential order (if they match the request path) and returns the first response that is not undefined.
 * If all middlewares return undefined, then a `NextResponse.next()` is returned.
 *
 * @param middlewares An array of application middlewares to be composed.
 * @returns A Next.js monolithic middleware that executes the provided middlewares in order.
 */
function toMonolithic(
  ...middlewares: ApplicationMiddleware<Params>[]
): MonolithicMiddleware {
  return async (req, event) => {
    for (const middleware of middlewares) {
      const matchResult = middleware.matcher(req.nextUrl.pathname);

      if (matchResult) {
        const responseOrNone = await middleware.handler(
          req,
          event,
          matchResult.params,
        );
        if (responseOrNone) {
          return responseOrNone;
        }
      }
    }

    return NextResponse.next();
  };
}

export { acquireMiddleware as createMiddleware, toMonolithic };
export type {
  ApplicationMiddleware,
  ApplicationMiddlewareHandler,
  ApplicationMiddlewareOptions,
  Params as ApplicationMiddlewareParams,
  Params as AnyApplicationMiddlewareParams,
};
