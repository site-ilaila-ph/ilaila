import { ApplicationMiddleware, createMiddleware } from "@/lib/middleware";
import { createSessionReader } from "@/lib/session/server";
import { NextResponse } from "next/server";
import { REDIRECT_ROUTE_FOR_AUTHENTICATED_USERS, REDIRECT_ROUTE_FOR_UNAUTHENTICATED_USERS } from "@/config/auth";
import { acquireCacheManager, acquireDb, acquireNextJSCookieMap } from "@/lib/live";

interface AuthMiddlewareFactoryOptions {
  paths: string[];
}

function requireAuthenticated(
  { paths }: AuthMiddlewareFactoryOptions,
): ApplicationMiddleware {
  return createMiddleware(async (request) => {
    const session = createSessionReader({
      db: acquireDb(),
      cache: acquireCacheManager(),
      cookieMap: await acquireNextJSCookieMap()
    });

    if (!await session.getSessionId()) {
      return NextResponse.redirect(new URL(REDIRECT_ROUTE_FOR_UNAUTHENTICATED_USERS, request.url));
    }
  }, { paths });
};

function requireGuest({
  paths,
}: AuthMiddlewareFactoryOptions): ApplicationMiddleware {
  return createMiddleware(
    async (request) => {
      const session = createSessionReader({
        db: acquireDb(),
        cache: acquireCacheManager(),
        cookieMap: await acquireNextJSCookieMap(),
      });

      if (await session.getSessionId()) {
        return NextResponse.redirect(
          new URL(REDIRECT_ROUTE_FOR_AUTHENTICATED_USERS, request.url),
        );
      }
    },
    { paths },
  );
}


export { requireAuthenticated, requireGuest };