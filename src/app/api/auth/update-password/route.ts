import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/errors";

export const runtime = "nodejs";

async function postUpdatePassword(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: body.password });
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapAuthError(req, error, {
      genericCode: "UPDATE_PASSWORD_FAILED",
      invalidCredentialsCode: "UPDATE_PASSWORD_UNAUTHORIZED",
      invalidCode: "UPDATE_PASSWORD_INVALID",
      rateLimitedCode: "UPDATE_PASSWORD_RATE_LIMITED",
      unavailableCode: "UPDATE_PASSWORD_UNAVAILABLE",
      unavailableDetail: "Password update is unavailable right now. Please try again later.",
      operationName: "Update password",
    });
  }
}

export const POST = withLogging(withUnhandledApiErrorHandling(postUpdatePassword), "postUpdatePassword");
