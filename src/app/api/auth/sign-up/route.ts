import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { mapAuthError } from "@/lib/errors";

export const runtime = "nodejs";

export const POST = withLogging(
  withUnhandledApiErrorHandling(
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
        return mapAuthError(req, error, {
          genericCode: "SIGN_UP_FAILED",
          invalidCode: "SIGN_UP_INVALID",
          rateLimitedCode: "SIGN_UP_RATE_LIMITED",
          unavailableCode: "SIGN_UP_UNAVAILABLE",
          unavailableDetail: "Sign up is unavailable right now. Please try again later.",
          operationName: "Sign up",
          specialMessageCheck: [
            { pattern: /already registered|already exists|already in use/i, code: "EMAIL_IN_USE" },
          ],
        });
      }
    }
  ),
  "signUp"
);