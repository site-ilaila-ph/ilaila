import { NextRequest, NextResponse } from "next/server";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  badRequestProblem,
  conflictProblem,
  internalErrorProblem,
  tooManyRequestsProblem,
} from "@/lib/responses/problem";
import { withLogging } from "@/lib/logging";

function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "__isAuthError" in error &&
    typeof (error as { status?: unknown }).status !== "undefined"
  );
}

function mapSignUpFailure(error: unknown): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem({ detail: "The request body must be valid JSON." });
  }

  if (isAuthError(error)) {
    const message = error.message || "Sign up failed.";
    const status = error.status ?? 400;

    if (status === 400) {
      if (/already registered|already exists|already in use/i.test(message)) {
        return conflictProblem({ code: "email-in-use", detail: message });
      }
      return badRequestProblem({ code: "sign-up-failed", detail: message });
    }

    if (status === 422) {
      return badRequestProblem({ code: "sign-up-invalid", detail: message });
    }

    if (status === 429) {
      return tooManyRequestsProblem({ code: "sign-up-rate-limited", detail: message });
    }

    if (status >= 500) {
      console.error("Sign up failed with upstream status", status, message);
      return internalErrorProblem({ detail: "Sign up is unavailable right now. Please try again later." });
    }

    return badRequestProblem({ code: "sign-up-failed", detail: message });
  }

  console.error("Sign up failed", error);
  return internalErrorProblem({ detail: "Sign up is unavailable right now. Please try again later." });
}
export const POST = withLogging(
  async function signUp(req: NextRequest) {
    try {
      const body = await req.json();
      const supabase = await createClient();
      const { error } = await supabase.auth.signUp({
        email: body.email,
        password: body.password,
      });
      if (error) throw error;
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
      return mapSignUpFailure(error);
    }
  },
  {
    name: "signUp",
    redact: {
      headers: ["authorization", "cookie"],
      bodyKeys: ["password"],
    },
  }
);