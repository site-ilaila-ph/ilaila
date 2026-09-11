import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  badRequestProblem,
  internalErrorProblem,
  tooManyRequestsProblem,
} from "@/lib/responses/problem";

function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "__isAuthError" in error &&
    typeof (error as { status?: unknown }).status !== "undefined"
  );
}

function mapForgotPasswordFailure(request: NextRequest, error: unknown) {
  if (error instanceof SyntaxError) {
    return badRequestProblem(request, { detail: "The request body must be valid JSON." });
  }

  if (error instanceof TypeError) {
    // new URL(req.url) failed or another malformed request input.
    return badRequestProblem(request, { code: "forgot-password-invalid", detail: "The request URL is invalid." });
  }

  if (isAuthError(error)) {
    const message = error.message || "Password reset request failed.";
    const status = error.status ?? 400;

    if (status === 429) {
      return tooManyRequestsProblem(request, { code: "forgot-password-rate-limited", detail: message });
    }

    if (status >= 500) {
      console.error("Forgot password failed with upstream status", status, message);
      return internalErrorProblem(request, { detail: "Password reset is unavailable right now. Please try again later." });
    }

    return badRequestProblem(request, { code: "forgot-password-failed", detail: message });
  }

  console.error("Forgot password failed", error);
  return internalErrorProblem(request, { detail: "Password reset is unavailable right now. Please try again later." });
}

async function postForgotPassword(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = new URL(req.url).origin;
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(body.email, { redirectTo: `${origin}/auth/update-password` });
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return mapForgotPasswordFailure(req, error);
  }
}

export const POST = withLogging(postForgotPassword, {
  name: "postForgotPassword",
  redact: { headers: ["authorization", "cookie"], bodyKeys: ["email"] },
});
