import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withLogging } from "@/lib/logging";

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
      const message = error instanceof Error ? error.message : "Unknown";
      return NextResponse.json({ success: false, type: "generic", message }, { status: 400 });
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