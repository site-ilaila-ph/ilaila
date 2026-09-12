import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/errors";

export const runtime = "nodejs";

async function postSignOut(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapAuthError(req, error, {
      genericCode: "SIGN_OUT_FAILED",
      rateLimitedCode: "SIGN_OUT_UNAVAILABLE",
      unavailableCode: "SIGN_OUT_UNAVAILABLE",
      unavailableDetail: "Sign out is unavailable right now. Please try again later.",
      operationName: "Sign out",
    });
  }
}

export const POST = withLogging(withUnhandledApiErrorHandling(postSignOut), "postSignOut");
