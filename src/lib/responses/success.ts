import { NextResponse } from "next/server";

export function successResponse<T>(
    data: T,
    init?: ResponseInit,
): NextResponse {
    return NextResponse.json(data, {
        ...init,
        status: init?.status ?? 200,
    });
}

export function ok<T>(data: T): NextResponse {
    return successResponse(data, {
        status: 200,
    });
}

export function created<T>(data: T): NextResponse {
    return successResponse(data, {
        status: 201,
    });
}

export function noContent(): NextResponse {
    return new NextResponse(null, {
        status: 204,
    });
}