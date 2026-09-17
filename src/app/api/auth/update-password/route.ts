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
  unprocessableProblem,
} from "@/lib/api/responses";

export const runtime = "nodejs";

async function postUpdatePassword(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: body.password });
    if (error) throw error;
    return noContent();
  } catch (error: unknown) {
    if (isAuthError(error)) {
      const message = error.message || "Nabigo ang pag-update ng password.";
      const status = error.status ?? 400;

      if (status === 401) {
        return unauthorizedProblem(req, {
          code: "update-password-unauthorized",
          title: "Hindi Autentificado",
          detail: message,
        });
      }

      if (status === 422) {
        return unprocessableProblem(req, {
          code: "update-password-invalid",
          title: "Hindi Ma-process",
          detail: message,
        });
      }

      if (status === 429) {
        return tooManyRequestsProblem(req, {
          code: "update-password-rate-limited",
          title: "Maraming Request",
          detail: message,
        });
      }

      if (status >= 500) {
        console.error("Update password failed with upstream status", status, message);
        return internalErrorProblem(req, {
          code: "update-password-unavailable",
          title: "Error sa Server",
          detail: "Ang pag-update ng password ay hindi available sa ngayon. Pakisubukan muli sa ibang pagkakataon.",
        });
      }

      return badRequestProblem(req, {
        code: "update-password-failed",
        title: "Maling Request",
        detail: message,
      });
    }

    throw error;
  }
}

export const POST = withLogging(withUnhandledApiErrorHandling(postUpdatePassword), "postUpdatePassword");
