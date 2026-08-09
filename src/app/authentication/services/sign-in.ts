import schema from "../validation/schemas/sign-in";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import db from "@/lib/server/db";
import cache from "@/lib/server/caching/cache";
import { verify } from "../lib/password";
import z from "zod";
import { ServerError } from "@/lib/server/errors";
import { SESSION_TOKEN_COOKIE_NAME } from "@/config/auth";

export default async function signIn({
  email,
  password,
}: z.output<typeof schema>) {
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    throw new ServerError({
      domain: "authentication",
      hint: "wrong-password-or-email",
      message: "Wrong password or email.",
      sensitive: false,
    });
  }

  const cookieStore = await cookies();

  // if the device already has a session.
  if (cookieStore.has(SESSION_TOKEN_COOKIE_NAME)) {
    return; // no need to do anything, user is already authenticated.
  }

  if (!verify(password, user.passwordHash)) {
    throw new ServerError({
      domain: "authentication",
      hint: "sign-in-failed",
      message: "Incorrect credentials.",
      sensitive: false,
    });
  }

  // issue a session after verification.
  const sessionId = crypto.randomBytes(32).toString("hex");
  const sessionTtlSeconds = 12 * 60 * 60;

  await cache.set(sessionId, user.id, sessionTtlSeconds);
  cookieStore.set("SESSION_TOKEN", sessionId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + sessionTtlSeconds * 1000),
  });

  return null;
}
