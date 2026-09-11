import { NextResponse } from "next/server";

export function redirectResponse(
    url: string | URL,
    status: number = 302,
): NextResponse {
    return NextResponse.redirect(url, status);
}

export function temporaryRedirect(
    url: string | URL,
): NextResponse {
    return redirectResponse(url, 307);
}

export function permanentRedirect(
    url: string | URL,
): NextResponse {
    return redirectResponse(url, 308);
}