"use server";
import schema from "@/app/auth/validation/schemas/sign-in"
import { toServerAction } from "@/lib/action/server";
import { signIn } from "@/app/auth/services";

export default toServerAction({ serviceFn: signIn, schema });
