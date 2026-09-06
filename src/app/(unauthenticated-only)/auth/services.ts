import signInSchema from "./validation/schemas/sign-in";
import signUpSchema from "./validation/schemas/sign-up";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { acquireCacheManager, acquirePrismaClient } from "@/lib/infra";
import { verify, hash } from "./lib/password";
import z from "zod";
import { SESSION_TOKEN_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/config/auth";
import { ServerError } from "@/lib/action/server";

export const signIn = async ({
  email,
  password,
}: z.output<typeof signInSchema>) => {
  const db = acquirePrismaClient();
  const user = await db.user.findFirst({ where: { email: String(email) } });

  if (!user) {
    throw new ServerError({
      domain: "authentication",
      hint: "wrong-password-or-email",
      message: "Mali ang password o email.",
      sensitive: false,
    });
  }

  const cookieStore = await cookies();

  // if the device already has a session.
  if (cookieStore.has(SESSION_TOKEN_COOKIE_NAME)) {
    return user.isAdmin; // no need to do anything, user is already authenticated.
  }

  if (!(await verify(password, user.passwordHash))) {
    throw new ServerError({
      domain: "authentication",
      hint: "sign-in-failed",
      message: "Mali ang mga kredensyal.",
      sensitive: false,
    });
  }

  // issue a session after verification.
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await db.session.create({
    data: {
      userId: user.id,
      expiresAt,
    }
  });

  const cache = acquireCacheManager();
  await cache.set({
    key: ["session", "via-id", sessionId],
    value: user.id,
    ttlSeconds: SESSION_TTL_SECONDS,
  });
  cookieStore.set("SESSION_TOKEN", sessionId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });

  return user.isAdmin;
};

export const signUp = async ({
  userName,
  email,
  password,
}: z.output<typeof signUpSchema>) => {
  const db = acquirePrismaClient();
  const passwordHash = await hash(password);

  try {
    const user = await db.user.create({
      userName: userName || null,
      email,
      passwordHash,
      isAdmin: false,
    });

    return {
      id: user.id,
      userName: user.userName,
      email: user.email,
    };
  } catch (error: any) {
    if (error?.code === '23505' || (error?.message && error.message.includes('unique'))) {
      const detail = error?.detail || error?.message || '';
      if (detail.includes('email')) {
        throw new ServerError({
          domain: 'authentication',
          hint: 'email-exists',
          message: 'May account nang gumagamit ng email na ito.',
          sensitive: false,
        });
      }

      if (detail.includes('userName') || detail.includes('username')) {
        throw new ServerError({
          domain: 'authentication',
          hint: 'username-exists',
          message: 'Ginagamit na ang username na ito.',
          sensitive: false,
        });
      }
    }

    throw new ServerError({
      domain: 'authentication',
      hint: 'unknown',
      message: 'May hindi inaasahang error habang gumagawa ng account.',
      sensitive: true,
    });
  }
};

export const signOut = async ({ }: Record<string, never>) => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_TOKEN_COOKIE_NAME)?.value ?? null;

  if (sessionToken) {
    const cache = acquireCacheManager();
    await cache.invalidate({ key: ["session", "via-id", sessionToken] });
    cookieStore.delete(SESSION_TOKEN_COOKIE_NAME);
  }
};
