import { NextResponse } from "next/server";

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

export interface ProblemDefaults {
    code: string;
    title: string;
    detail: string;
}

export type ProblemOverrides = Partial<
    Omit<ProblemDetails, "status" | "type">
> & {
    code?: string;
};

function typeFromCode(request: Request, code: string): string {
    const origin = new URL(request.url).origin;

    return `${origin}/problems/${code}`;
}

function instanceFromRequest(request: Request): string {
    return new URL(request.url).toString();
}

export function problemResponse(
    request: Request,
    problem: ProblemDetails,
    init?: ResponseInit,
): NextResponse {
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
    return (
        request: Request,
        overrides?: ProblemOverrides,
    ): NextResponse => {
        const {
            code,
            title,
            detail,
            instance,
            errors,
            ...rest
        } = overrides ?? {};

        const resolvedCode = code ?? defaults.code;

        const problem: ProblemDetails = {
            ...rest,
            type: typeFromCode(request, resolvedCode),
            title: title ?? defaults.title,
            detail: detail ?? defaults.detail,
            instance: instance ?? instanceFromRequest(request),
            errors,
            status,
        };

        return problemResponse(request, problem);
    };
}

export const badRequestProblem = defineProblem(400, {
    code: "bad-request",
    title: "Bad Request",
    detail:
        "The request could not be understood or was missing required parameters.",
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

export const unsupportedMediaTypeProblem = defineProblem(415, {
    code: "unsupported-media-type",
    title: "Unsupported Media Type",
    detail: "The request media type is not supported.",
});

export const conflictProblem = defineProblem(409, {
    code: "conflict",
    title: "Conflict",
    detail: "The request conflicts with the current state of the resource.",
});

export const tooManyRequestsProblem = defineProblem(429, {
    code: "too-many-requests",
    title: "Too Many Requests",
    detail: "Too many requests. Please try again later.",
});

export const badGatewayProblem = defineProblem(502, {
    code: "bad-gateway",
    title: "Bad Gateway",
    detail: "An upstream service failed to respond.",
});

export const internalErrorProblem = defineProblem(500, {
    code: "internal-server-error",
    title: "Internal Server Error",
    detail: "Internal server error.",
});