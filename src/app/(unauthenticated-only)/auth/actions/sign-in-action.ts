"use server";
import schema from "@/app/(unauthenticated-only)/auth/validation/schemas/sign-in"
import { toServerAction } from "@/lib/action/server";
import { signIn } from "@/app/(unauthenticated-only)/auth/services";

export default toServerAction({ serviceFn: signIn, schema });
