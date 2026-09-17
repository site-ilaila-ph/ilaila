import { NextRequest } from "next/server";
import { isAuthError } from "@supabase/supabase-js";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import {
  badRequestProblem,
  internalErrorProblem,
  noContent,
  tooManyRequestsProblem,
  unauthorizedProblem,
} from "@/lib/api/responses";

export const runtime = "nodejs";

async function postSignIn(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });
    if (error) throw error;
    return noContent();
  } catch (error: unknown) {
    if (isAuthError(error)) {
      const message = error.message || "Nabigo ang pag-sign in.";
      const status = error.status ?? 400;

      if (status === 401) {
        return unauthorizedProblem(req, {
          code: "invalid-credentials",
          title: "Hindi Autentificado",
          detail: message,
        });
      }

      if (status === 429) {
        return tooManyRequestsProblem(req, {
          code: "sign-in-rate-limited",
          title: "Maraming Request",
          detail: message,
        });
      }

      if (status >= 500) {
        console.error("Sign in failed with upstream status", status, message);
        return internalErrorProblem(req, {
          code: "sign-in-unavailable",
          title: "Error sa Server",
          detail: "Ang sign in ay hindi available sa ngayon. Pakisubukan muli sa ibang pagkakataon.",
        });
      }

      return badRequestProblem(req, {
        code: "sign-in-failed",
        title: "Maling Request",
        detail: message,
      });
    }

    throw error;
  }
}

export const POST = withLogging(withUnhandledApiErrorHandling(postSignIn), "postSignIn");
