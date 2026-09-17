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
    return successResponse(data);
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

export interface ProblemDetails {
    type: string;
    title: string;
    status: number;
    detail: string;
    code: string;
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

function typeFromCode(origin: string, code: string): string {
    return `${origin}/problems/${code}`;
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
        const url = new URL(request.url);

        const problem: ProblemDetails = {
            ...rest,
            type: typeFromCode(url.origin, resolvedCode),
            title: title ?? defaults.title,
            detail: detail ?? defaults.detail,
            code: resolvedCode,
            instance: instance ?? url.toString(),
            errors,
            status,
        };

        return problemResponse(request, problem);
    };
}

export const badRequestProblem = defineProblem(400, {
    code: "bad-request",
    title: "Hindi Ko Naintindihan",
    detail:
        "Hindi ko maintindihan ang request mo o may kulang na impormasyon.",
});

export const unauthorizedProblem = defineProblem(401, {
    code: "unauthorized",
    title: "Kailangan Kitang Makilala Muna",
    detail: "Kailangan mo munang mag-sign in bago ko ito maproseso.",
});

export const forbiddenProblem = defineProblem(403, {
    code: "forbidden",
    title: "Hindi Kita Mabibigyan ng Access",
    detail: "Hindi kita mabibigyan ng access sa hinihiling mong resource.",
});

export const notFoundProblem = defineProblem(404, {
    code: "not-found",
    title: "Hindi Ko Mahanap",
    detail: "Hindi ko mahanap ang hinihiling mong resource.",
});

export const unprocessableProblem = defineProblem(422, {
    code: "unprocessable-entity",
    title: "Hindi Ko Maproseso",
    detail: "Naintindihan ko ang request mo, pero hindi ko ito maproseso.",
});

export const unsupportedMediaTypeProblem = defineProblem(415, {
    code: "unsupported-media-type",
    title: "Hindi Ko Suportado ang Media na Ito",
    detail: "Hindi ko suportado ang uri ng media na ipinadala mo.",
});

export const conflictProblem = defineProblem(409, {
    code: "conflict",
    title: "May Salungatan Ako sa Request Mo",
    detail: "Salungat ang request mo sa kasalukuyan kong estado.",
});

export const tooManyRequestsProblem = defineProblem(429, {
    code: "too-many-requests",
    title: "Sobra Na Akong Request",
    detail: "Sobra na akong nakakatanggap ng request. Subukan mo ulit mamaya.",
});

export const badGatewayProblem = defineProblem(502, {
    code: "bad-gateway",
    title: "Hindi Ako Nakatanggap ng Tugon",
    detail: "Hindi ako nakatanggap ng tugon mula sa upstream service ko.",
});

export const internalErrorProblem = defineProblem(500, {
    code: "internal-server-error",
    title: "May Error Sa Akin",
    detail: "May naganap na error sa akin. Paumanhin.",
});
