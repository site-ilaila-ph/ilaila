import { ApplicationMiddleware, createMiddleware } from "@/lib/server/middleware";
import { AuthMiddlewareFactoryOptions } from "./types";
import { getSessionId } from "@/lib/server/session";
import { NextResponse } from "next/server";
import { REDIRECT_ROUTE_FOR_UNAUTHENTICATED_USERS } from "@/config/auth";

function requireAuthenticated(
  { paths }: AuthMiddlewareFactoryOptions,
): ApplicationMiddleware {
  return createMiddleware(async (request) => {
    if (!await getSessionId()) {
      return NextResponse.redirect(new URL(REDIRECT_ROUTE_FOR_UNAUTHENTICATED_USERS, request.url));
    }
  }, { paths });
};

export default requireAuthenticated;