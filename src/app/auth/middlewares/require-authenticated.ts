import { ApplicationMiddleware, createMiddleware } from "@/lib/middleware";
import { AuthMiddlewareFactoryOptions } from "./types";
import { createSessionReader } from "@/lib/session/client";
import { NextResponse } from "next/server";
import { REDIRECT_ROUTE_FOR_UNAUTHENTICATED_USERS } from "@/config/auth";
import { acquireCacheManager, acquireDb, acquireNextJSCookieMap } from "@/lib/live";

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

export default requireAuthenticated;