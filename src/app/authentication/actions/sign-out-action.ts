"use server";

import toServerAction from "@/lib/server/actions";
import signOut from "../services/sign-out";
import z from "zod";

export default toServerAction({ serviceFn: signOut, schema: z.object() });