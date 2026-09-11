/* eslint-disable @typescript-eslint/no-explicit-any */
import { assert } from "./assert";
import type { ProblemDetails } from "./problem";

const origin = process.env.NEXT_PUBLIC_ORIGIN_URL;
assert(origin, "No origin url configured.");


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
        });
    }

    const body: unknown = await res.json();

    if (!isProblemDetails(body)) {
        throw new ApiProblemError({
            type: "about:blank",
            title: "Malformed error response",
            status: res.status,
            detail: "Server returned an error without a valid problem details body.",
        });
    }

    throw new ApiProblemError(body);
}


export async function api<T>(
    path: string,
    options?: RequestInit,
): Promise<T> {
    const url = new URL(path, origin);

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

export async function apiWithUploads<T>(
    path: string,
    data: { [key: string]: any; },
): Promise<T> {
    const uploadResponse = await api<{
        [key: string]: {
            uploadId: string;
            uploadUrl: string;
        };
    }>(path, {
        method: "POST",
    });

    const uploadIds: Record<string, string> = {};

    for (const [key, file] of Object.entries(data)) {
        const upload = uploadResponse[key];

        if (!upload) {
            throw new Error(`Server did not provide an upload for "${key}".`);
        }

        const response = await fetch(upload.uploadUrl, {
            method: "PUT",
            body: file,
        });

        if (!response.ok) {
            throw new Error(`Failed to upload "${key}".`);
        }

        uploadIds[key] = upload.uploadId;
    }

    return await api<T>(path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadIds),
    });
}