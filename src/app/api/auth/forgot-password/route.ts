import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = new URL(req.url).origin;
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(body.email, { redirectTo: `${origin}/auth/update-password` });
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, type: "generic", message: error instanceof Error && 'message' in error ? error.message : 'Unknown Error.' }, { status: 400 });
  }
}
