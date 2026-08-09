"use server";
import schema from "@/app/authentication/validation/schemas/sign-in"
import toServerAction from "@/lib/server/actions";
import signIn from "@/app/authentication/services/sign-in";

export default toServerAction({ serviceFn: signIn, schema });
