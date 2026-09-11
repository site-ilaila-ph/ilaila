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

function mapSignInFailure(request: NextRequest, error: unknown): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem(request, { detail: "The request body must be valid JSON." });
  }

  if (isAuthError(error)) {
    const message = error.message || "Sign in failed.";
    const status = error.status ?? 400;

    if (status === 400) {
      return badRequestProblem(request, { code: "sign-in-failed", detail: message });
    }

    if (status === 401) {
      return unauthorizedProblem(request, { code: "invalid-credentials", detail: message });
    }

    if (status === 422) {
      return badRequestProblem(request, { code: "invalid-credentials", detail: message });
    }

    if (status === 429) {
      return tooManyRequestsProblem(request, { code: "sign-in-rate-limited", detail: message });
    }

    if (status >= 500) {
      console.error("Sign in failed with upstream status", status, message);
      return internalErrorProblem(request, { detail: "Sign in is unavailable right now. Please try again later." });
    }

    return badRequestProblem(request, { code: "sign-in-failed", detail: message });
  }

  console.error("Sign in failed", error);
  return internalErrorProblem(request, { detail: "Sign in is unavailable right now. Please try again later." });
}

function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "__isAuthError" in error &&
    typeof (error as { status?: unknown }).status !== "undefined"
  );
}

async function postSignIn(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapSignInFailure(req, error);
  }
}

export const POST = withLogging(postSignIn, {
  name: "postSignIn",
  redact: { headers: ["authorization", "cookie"], bodyKeys: ["password"] },
});
