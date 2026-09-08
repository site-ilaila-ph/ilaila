import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get("email");

    if (!email) {
        return NextResponse.json({
            type: "error",
            code: "EMAIL_REQUIRED",
            message: "email is required.",
        }, { status: 400 });
    }

    const client = await createClient();
    const { error } = await client.auth.resetPasswordForEmail(email);

    if (error) {
        return NextResponse.json({
            type: "error",
            code: `KNOWN_SUPABASE_AUTH_ERROR:${error.code}`,
        }, { status: error.status });
    }

    return new NextResponse();
}