import { toMonolithic } from "@/lib/middleware";
import requireAuthenticated from "@/app/auth/middlewares/require-authenticated";
import requireGuest from "@/app/auth/middlewares/require-guest";
import { MiddlewareConfig } from "next/server";

export default toMonolithic(
  requireAuthenticated({
    paths: ["/home"],
  }),
  requireGuest({
    paths: [
      "/landing",
      "/authentication/signup",
      "/authentication/signin",
      "/authentication/signout",
    ],
  }),
);

export const config: MiddlewareConfig = {
  matcher: ["/:path*"],
};
