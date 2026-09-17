import type { ProblemDetails } from "./responses";

export class ApiProblemError extends Error {
    readonly problem: ProblemDetails;

    constructor(problem: ProblemDetails, options?: ErrorOptions) {
        super(problem.detail || problem.title, options);
        this.name = "ApiProblemError";
        this.problem = problem;
        Object.setPrototypeOf(this, ApiProblemError.prototype);
    }
}

function isProblemDetails(value: unknown): value is ProblemDetails {
    return (
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        "title" in value &&
        "status" in value
    );
}

export async function throwProblem(res: Response): Promise<void> {
    const contentType = res.headers.get("content-type") ?? "";

    if (!contentType.includes("application/problem+json")) {
        throw new ApiProblemError({
            type: "about:blank",
            title: res.statusText || "Request failed",
            status: res.status,
            detail: `Request failed with status ${res.status}`,
            code: "request-failed",
        });
    }

    const body: unknown = await res.json();

    if (!isProblemDetails(body)) {
        throw new ApiProblemError({
            type: "about:blank",
            title: "Malformed error response",
            status: res.status,
            detail: "Server returned an error without a valid problem details body.",
            code: "malformed-error",
        });
    }

    throw new ApiProblemError(body);
}

function legacyMessage(body: unknown): string | undefined {
    if (typeof body !== "object" || body === null) return undefined;
    const record = body as Record<string, unknown>;
    for (const key of ["detail", "message", "error"]) {
        const value = record[key];
        if (typeof value === "string" && value) return value;
    }
    return undefined;
}

export function problemMessageFromBody(body: unknown, fallback: string): string {
    if (isProblemDetails(body)) {
        return body.detail || body.title || fallback;
    }
    return legacyMessage(body) ?? fallback;
}

export async function readProblemMessage(response: Response, fallback: string): Promise<string> {
    try {
        const body: unknown = await response.json();
        return problemMessageFromBody(body, fallback);
    } catch {
        return fallback;
    }
}


export async function api<T>(
    path: string,
    options?: RequestInit,
): Promise<T> {
    const url = new URL(path, window.location.origin);
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: "application/json",
            ...options?.headers,
        },
    });

    if (response.status == 204) return undefined as T;

    if (!response.ok) {
        await throwProblem(response);
    }
    return await response.json() as T;
}
