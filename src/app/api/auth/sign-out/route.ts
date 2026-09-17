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
} from "@/lib/api/responses";

export const runtime = "nodejs";

async function postSignOut(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return noContent();
  } catch (error: unknown) {
    if (isAuthError(error)) {
      const message = error.message || "Nabigo ang pag-sign out.";
      const status = error.status ?? 400;

      if (status === 429) {
        return tooManyRequestsProblem(req, {
          code: "sign-out-unavailable",
          title: "Error sa Server",
          detail: message,
        });
      }

      if (status >= 500) {
        console.error("Sign out failed with upstream status", status, message);
        return internalErrorProblem(req, {
          code: "sign-out-unavailable",
          title: "Error sa Server",
          detail: "Ang sign out ay hindi available sa ngayon. Pakisubukan muli sa ibang pagkakataon.",
        });
      }

      return badRequestProblem(req, {
        code: "sign-out-failed",
        title: "Maling Request",
        detail: message,
      });
    }

    throw error;
  }
}

export const POST = withLogging(withUnhandledApiErrorHandling(postSignOut), "postSignOut");
