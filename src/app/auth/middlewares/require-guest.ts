import { ApplicationMiddleware, createMiddleware } from "@/lib/middleware";
import { AuthMiddlewareFactoryOptions } from "./types";
import { NextResponse } from "next/server";
import { REDIRECT_ROUTE_FOR_AUTHENTICATED_USERS } from "@/config/auth";
import { createSessionReader } from "@/lib/session/client";
import {
  acquireDb,
  acquireCacheManager,
  acquireNextJSCookieMap,
} from "@/lib/live";

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

export default requireGuest;
