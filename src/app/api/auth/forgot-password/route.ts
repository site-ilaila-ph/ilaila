import { NextRequest } from "next/server";
import { isAuthError } from "@supabase/supabase-js";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { createClient } from "@/lib/supabase/server";
import {
  badRequestProblem,
  internalErrorProblem,
  noContent,
  tooManyRequestsProblem,
} from "@/lib/api/responses";

export const runtime = "nodejs";

async function postForgotPassword(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = new URL(req.url).origin;
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(body.email, { redirectTo: `${origin}/auth/update-password` });
    if (error) throw error;
    return noContent();
  } catch (error: unknown) {
    if (isAuthError(error)) {
      const message = error.message || "Nabigo ang kahilingan sa pag-reset ng password.";
      const status = error.status ?? 400;

      if (status === 429) {
        return tooManyRequestsProblem(req, {
          code: "forgot-password-rate-limited",
          title: "Maraming Request",
          detail: message,
        });
      }

      if (status >= 500) {
        console.error("Forgot password failed with upstream status", status, message);
        return internalErrorProblem(req, {
          code: "forgot-password-unavailable",
          title: "Error sa Server",
          detail: "Ang pag-reset ng password ay hindi available sa ngayon. Pakisubukan muli sa ibang pagkakataon.",
        });
      }

      return badRequestProblem(req, {
        code: "forgot-password-failed",
        title: "Maling Request",
        detail: message,
      });
    }

    throw error;
  }
}

export const POST = withLogging(withUnhandledApiErrorHandling(postForgotPassword), "postForgotPassword");
