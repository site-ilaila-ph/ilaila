"use server";
import schema from "@/app/auth/validation/schemas/sign-in"
import { toServerAction } from "@/lib/action";
import signIn from "@/app/auth/services/sign-in";

export default toServerAction({ serviceFn: signIn, schema });
