import schema from "../validation/schemas/sign-up";

import crypto from "node:crypto";
import { hash } from "@/app/auth/lib/password";
import type { UserWithNoSensitiveDetails } from "../lib/types";
import z from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { acquireDb } from "@/lib/live";
import { ServerError } from "@/lib/action";

export default async function signUp({
  userName,
  email,
  password,
}: z.output<typeof schema>) {
  const passwordHash = await hash(password);

  try {
    const db = acquireDb();
    const user = await db.user.create({
      data: {
        id: crypto.randomUUID(),
        userName,
        email,
        passwordHash,
      },
    });

    return {
      id: user.id,
      userName: user.userName,
      email: user.email,
    } as UserWithNoSensitiveDetails;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];

      if (target.includes('email')) {
        throw new ServerError({
          domain: 'authentication',
          hint: 'email-exists',
          message: 'An account with this email already exists.',
          sensitive: false,
        });
      }

      if (target.includes('userName')) {
        throw new ServerError({
          domain: 'authentication',
          hint: 'username-exists',
          message: 'This username is already taken.',
          sensitive: false,
        });
      }
    }

    throw new ServerError({
      domain: 'authentication',
      hint: 'unknown',
      message: 'An unexpected error occurred during sign up.',
      sensitive: true,
    });
  }
}
