"use server";
import schema from "@/app/authentication/validation/schemas/sign-up";
import toServerAction from "@/lib/server/actions";
import signUp from "../services/sign-up";


export default toServerAction({ serviceFn: signUp, schema });