import { NextResponse } from "next/server";
import { assert } from "./assert";

// computed parameters.
const origin = process.env.NEXT_PUBLIC_ORIGIN_URL;
assert(origin, "No origin url configured.");

export interface ProblemDetails {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

// The shape callers actually author against: a stable `code` instead of a
// raw `type` URL. `type` is derived from `code` at response-build time.
export interface ProblemDefaults {
    code: string;
    title: string;
    detail: string;
}

// What a caller can override per-helper: everything except `status`
// (fixed by which helper you called) and `type` (derived from `code`, never set directly).
export type ProblemOverrides = Partial<Omit<ProblemDetails, "status" | "type">> & {
    code?: string;
};

function typeFromCode(code: string): string {
    return `${origin}/problems/${code}`;
}

export function problemResponse(problem: ProblemDetails, init?: ResponseInit): NextResponse {
    const status = problem.status || init?.status || 500;
    return NextResponse.json(problem, {
        ...init,
        status,
        headers: {
            "Content-Type": "application/problem+json",
            ...(init?.headers || {}),
        },
    });
}

function defineProblem(status: number, defaults: ProblemDefaults) {
    return (overrides?: ProblemOverrides): NextResponse => {
        const { code, title, detail, instance, errors, ...rest } = overrides ?? {};

        const resolvedCode = code ?? defaults.code;

        const problem: ProblemDetails = {
            ...rest,
            type: typeFromCode(resolvedCode),
            title: title ?? defaults.title,
            detail: detail ?? defaults.detail,
            instance,
            errors,
            status,
        };

        return problemResponse(problem);
    };
}

export const badRequestProblem = defineProblem(400, {
    code: "bad-request",
    title: "Bad Request",
    detail: "The request could not be understood or was missing required parameters.",
});

export const unauthorizedProblem = defineProblem(401, {
    code: "unauthorized",
    title: "Unauthorized",
    detail: "Authentication required.",
});

export const forbiddenProblem = defineProblem(403, {
    code: "forbidden",
    title: "Forbidden",
    detail: "Access forbidden.",
});

export const notFoundProblem = defineProblem(404, {
    code: "not-found",
    title: "Not Found",
    detail: "Resource not found.",
});

export const unprocessableProblem = defineProblem(422, {
    code: "unprocessable-entity",
    title: "Unprocessable Entity",
    detail: "Unprocessable entity.",
});

export const internalErrorProblem = defineProblem(500, {
    code: "internal-server-error",
    title: "Internal Server Error",
    detail: "Internal server error.",
});