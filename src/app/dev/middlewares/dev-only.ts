import { ApplicationMiddlewareOptions, createMiddleware } from "@/lib/server/middleware";
import { NextResponse } from "next/server";

function devOnly(opts: ApplicationMiddlewareOptions) {
    return createMiddleware(async () => {
        if (process.env.NODE_ENV == "production") return NextResponse.redirect('/404', { status: 404 });
    }, opts)
}

export default devOnly;