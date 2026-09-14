import { NextRequest, NextResponse } from "next/server";
import { isAuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import {
  badRequestProblem,
  conflictProblem,
  internalErrorProblem,
  tooManyRequestsProblem,
  unprocessableProblem,
} from "@/lib/api/responses";

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
        if (
          error instanceof Error &&
          /already registered|already exists|already in use/i.test(error.message)
        ) {
          return conflictProblem(req, {
            code: "email-in-use",
            title: "Salungatan",
            detail: "Mayroon nang account na may email na ito.",
          });
        }

        if (isAuthError(error)) {
          const message = error.message || "Nabigo ang pag-sign up.";
          const status = error.status ?? 400;

          if (status === 422) {
            return unprocessableProblem(req, {
              code: "sign-up-invalid",
              title: "Hindi Ma-process",
              detail: message,
            });
          }

          if (status === 429) {
            return tooManyRequestsProblem(req, {
              code: "sign-up-rate-limited",
              title: "Maraming Request",
              detail: message,
            });
          }

          if (status >= 500) {
            console.error("Sign up failed with upstream status", status, message);
            return internalErrorProblem(req, {
              code: "sign-up-unavailable",
              title: "Error sa Server",
              detail: "Ang sign up ay hindi available sa ngayon. Pakisubukan muli sa ibang pagkakataon.",
            });
          }

          return badRequestProblem(req, {
            code: "sign-up-failed",
            title: "Maling Request",
            detail: message,
          });
        }

        throw error;
      }
    }
  ),
  "signUp"
);