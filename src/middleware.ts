import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { match } from "path-to-regexp";

import { acquirePrismaClient } from "./lib/infra";
import { safeNextPath } from "./lib/safe-next-path";
import { notFoundProblem, redirectResponse } from "./lib/responses";

// Routes reachable without a session.
const isPublicRoute = match([
  "/",
  "/landing",
  "/auth/*rest",
  "/api/auth/*rest",
]);

const isAdminOnlyRoute = match([
  "/management/*rest",
]);

export const middleware = async (request: NextRequest) => {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          // Copy cookies to the request so subsequent middleware/server
          // code sees the refreshed session.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Recreate the response with the modified request.
          response = NextResponse.next({
            request,
          });

          // Copy Supabase's cookies to the actual response sent to the browser.
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;

  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/landing";

    return NextResponse.redirect(url);
  }

  if (!user) {
    return response;
  }

  const userData = await acquirePrismaClient().userData.findFirstOrThrow({
    select: {
      id: true,
      role: true,
    },
    where: {
      authId: user.sub,
    },
  });

  // Resolve '/'.
  if (pathname === "/") {
    const target =
      userData.role === "admin"
        ? safeNextPath("/management")
        : "/home";

    return redirectResponse(new URL(target, request.url));
  }

  // Protect specific routes.
  if (isAdminOnlyRoute(pathname)) {
    if (userData.role !== "admin") {
      return notFoundProblem(request);
    }
  }

  return response;
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};