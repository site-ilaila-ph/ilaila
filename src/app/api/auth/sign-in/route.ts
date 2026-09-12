import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/errors";

export const runtime = "nodejs";

async function postSignIn(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapAuthError(req, error, {
      genericCode: "SIGN_IN_FAILED",
      invalidCredentialsCode: "INVALID_CREDENTIALS",
      invalidCode: "SIGN_IN_FAILED",
      rateLimitedCode: "SIGN_IN_RATE_LIMITED",
      unavailableCode: "SIGN_IN_UNAVAILABLE",
      unavailableDetail: "Sign in is unavailable right now. Please try again later.",
      operationName: "Sign in",
    });
  }
}

export const POST = withLogging(withUnhandledApiErrorHandling(postSignIn), "postSignIn");
