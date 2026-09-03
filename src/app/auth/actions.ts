"use server";

import { toServerAction } from "@/lib/action/server";
import { signIn, signUp, signOut } from "@/app/auth/services";
import signInSchema from "@/app/auth/validation/schemas/sign-in";
import signUpSchema from "@/app/auth/validation/schemas/sign-up";
import z from "zod";

export const signInAction = toServerAction({
  serviceFn: signIn,
  schema: signInSchema,
});

export const signUpAction = toServerAction({
  serviceFn: signUp,
  schema: signUpSchema,
});

export const signOutAction = toServerAction({
  serviceFn: signOut,
  schema: z.object({}),
});
