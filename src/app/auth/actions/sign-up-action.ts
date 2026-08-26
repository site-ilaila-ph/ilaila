"use server";
import schema from "@/app/auth/validation/schemas/sign-up";
import toServerAction from "@/lib/actions";
import signUp from "../services/sign-up";


export default toServerAction({ serviceFn: signUp, schema });