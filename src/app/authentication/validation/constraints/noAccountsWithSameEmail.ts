import { NextRequest } from "next/server";
import z from "zod";
import signUpSchema from "../schemas/sign-up";

export default async function noDuplicateUser({
    email
}: z.infer<typeof signUpSchema>) {
    
}