import { toMonolithic } from "@/lib/server/middleware";
import requireAuthenticated from "@/app/authentication/middlewares/require-authenticated";
import requireGuest from "@/app/authentication/middlewares/require-guest";
import { MiddlewareConfig } from "next/server";
import devOnly from "./app/dev/middlewares/dev-only";

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
  devOnly({ paths: ["/dev/*paths"] }),
);

export const config: MiddlewareConfig = {
  matcher: ["/:path*"],
};
