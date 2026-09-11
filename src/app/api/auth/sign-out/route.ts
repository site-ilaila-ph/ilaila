import { NextRequest, NextResponse } from 'next/server'
import { withLogging } from '@/lib/logging'
import type { AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { badRequestProblem, internalErrorProblem } from '@/lib/responses/problem'

export const runtime = "nodejs";

function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "__isAuthError" in error &&
    typeof (error as { status?: unknown }).status !== "undefined"
  );
}

function mapSignOutFailure(request: NextRequest, error: unknown) {
  if (isAuthError(error)) {
    const message = error.message || "Sign out failed.";
    const status = error.status ?? 400;

    if (status >= 500) {
      console.error("Sign out failed with upstream status", status, message);
      return internalErrorProblem(request, { detail: "Sign out is unavailable right now. Please try again later." });
    }

    return badRequestProblem(request, { code: "sign-out-failed", detail: message });
  }

  console.error("Sign out failed", error);
  return internalErrorProblem(request, { detail: "Sign out is unavailable right now. Please try again later." });
}

async function postSignOut(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    return mapSignOutFailure(req, error)
  }
}

export const POST = withLogging(postSignOut, {
  name: "postSignOut",
  redact: { headers: ["authorization", "cookie"] },
});
