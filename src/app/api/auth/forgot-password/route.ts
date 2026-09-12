import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/errors";

export const runtime = "nodejs";

async function postForgotPassword(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = new URL(req.url).origin;
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(body.email, { redirectTo: `${origin}/auth/update-password` });
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapAuthError(req, error, {
      genericCode: "FORGOT_PASSWORD_FAILED",
      rateLimitedCode: "FORGOT_PASSWORD_RATE_LIMITED",
      unavailableCode: "FORGOT_PASSWORD_UNAVAILABLE",
      unavailableDetail: "Password reset is unavailable right now. Please try again later.",
      operationName: "Forgot password",
    });
  }
}

export const POST = withLogging(withUnhandledApiErrorHandling(postForgotPassword), "postForgotPassword");
