import { ApplicationMiddleware, createMiddleware } from "@/lib/server/middleware";
import { AuthMiddlewareFactoryOptions } from "./types";
import { getSessionId } from "@/app/authentication/services/session";
import { NextResponse } from "next/server";
import { REDIRECT_ROUTE_FOR_AUTHENTICATED_USERS } from "@/config/auth";

function requireGuest(
  { paths }: AuthMiddlewareFactoryOptions,
): ApplicationMiddleware {
  return createMiddleware(async (request) => {
    if (await getSessionId()) {
      return NextResponse.redirect(new URL(REDIRECT_ROUTE_FOR_AUTHENTICATED_USERS, request.url));
    }
  }, { paths });
};

export default requireGuest;