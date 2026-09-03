import { toMonolithic } from "@/lib/middleware";
import { requireAuthenticated, requireGuest } from "@/app/auth/middlewares";
import { MiddlewareConfig } from "next/server";

export default toMonolithic(
  requireAuthenticated({
    paths: ["/", "/home"],
  }),
  requireGuest({
    paths: [
      "/",
      "/landing",
      "/auth/sign-up",
      "/auth/sign-in",
    ],
  }),
);

export const config: MiddlewareConfig = {
  matcher: ["/:path*"],
};
