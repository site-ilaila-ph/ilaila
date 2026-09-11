import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  badRequestProblem,
  internalErrorProblem,
  tooManyRequestsProblem,
  unauthorizedProblem,
} from "@/lib/responses/problem";

function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "__isAuthError" in error &&
    typeof (error as { status?: unknown }).status !== "undefined"
  );
}

function mapUpdatePasswordFailure(request: NextRequest, error: unknown) {
  if (error instanceof SyntaxError) {
    return badRequestProblem(request, { detail: "The request body must be valid JSON." });
  }

  if (isAuthError(error)) {
    const message = error.message || "Password update failed.";
    const status = error.status ?? 400;

    if (status === 401) {
      return unauthorizedProblem(request, { code: "update-password-unauthorized", detail: message });
    }

    if (status === 422) {
      return badRequestProblem(request, { code: "update-password-invalid", detail: message });
    }

    if (status === 429) {
      return tooManyRequestsProblem(request, { code: "update-password-rate-limited", detail: message });
    }

    if (status >= 500) {
      console.error("Update password failed with upstream status", status, message);
      return internalErrorProblem(request, { detail: "Password update is unavailable right now. Please try again later." });
    }

    return badRequestProblem(request, { code: "update-password-failed", detail: message });
  }

  console.error("Update password failed", error);
  return internalErrorProblem(request, { detail: "An unexpected error occurred." });
}

async function postUpdatePassword(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: body.password });
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapUpdatePasswordFailure(req, error);
  }
}

export const POST = withLogging(postUpdatePassword, {
  name: "postUpdatePassword",
  redact: { headers: ["authorization", "cookie"], bodyKeys: ["password"] },
});
