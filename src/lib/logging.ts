import type { NextRequest } from "next/server";

// ---- App Router route handler types ----

type RouteContext<TParams extends Record<string, string | string[]> = Record<string, never>> = {
    params: Promise<TParams>;
};

type RouteHandler<TParams extends Record<string, string | string[]> = Record<string, never>> = (
    request: NextRequest,
    context: RouteContext<TParams>
) => Promise<Response> | Response;

type RedactOptions = {
    headers?: string[];
    bodyKeys?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    custom?: (value: any, kind: "headers" | "body") => any;
};

const REDACTED = "[REDACTED]";

function redactHeaders(headers: Headers, keys: string[]): Record<string, string> {
    const lowerKeys = new Set(keys.map((k) => k.toLowerCase()));
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
        result[key] = lowerKeys.has(key.toLowerCase()) ? REDACTED : value;
    });
    return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function redactBody(value: any, keys: string[]): any {
    if (keys.length === 0 || value === null || typeof value !== "object") return value;

    const lowerKeys = new Set(keys.map((k) => k.toLowerCase()));

    if (Array.isArray(value)) {
        return value.map((item) => redactBody(item, keys));
    }

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
        if (lowerKeys.has(key.toLowerCase())) {
            result[key] = REDACTED;
        } else if (val !== null && typeof val === "object") {
            result[key] = redactBody(val, keys);
        } else {
            result[key] = val;
        }
    }
    return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeStringify(value: any): string {
    try {
        return JSON.stringify(value);
    } catch {
        return "[unserializable]";
    }
}

async function describeRequest(request: NextRequest, redact: RedactOptions) {
    const headers = redactHeaders(request.headers, redact.headers ?? []);

    let body: unknown = undefined;
    try {
        const clone = request.clone();
        const text = await clone.text();
        if (text) {
            try {
                const parsed = JSON.parse(text);
                body = redact.bodyKeys ? redactBody(parsed, redact.bodyKeys) : parsed;
            } catch {
                body = text; // non-JSON body, log as-is
            }
        }
    } catch {
        body = "[unreadable]";
    }

    if (redact.custom) {
        return {
            method: request.method,
            url: request.url,
            headers: redact.custom(headers, "headers"),
            body: body !== undefined ? redact.custom(body, "body") : undefined,
        };
    }

    return { method: request.method, url: request.url, headers, body };
}

async function describeResponse(response: Response, redact: RedactOptions) {
    const headers = redactHeaders(response.headers, redact.headers ?? []);

    let body: unknown = undefined;
    try {
        const clone = response.clone();
        const text = await clone.text();
        if (text) {
            try {
                const parsed = JSON.parse(text);
                body = redact.bodyKeys ? redactBody(parsed, redact.bodyKeys) : parsed;
            } catch {
                body = text;
            }
        }
    } catch {
        body = "[unreadable]";
    }

    if (redact.custom) {
        return {
            status: response.status,
            headers: redact.custom(headers, "headers"),
            body: body !== undefined ? redact.custom(body, "body") : undefined,
        };
    }

    return { status: response.status, headers, body };
}

function withLogging<TParams extends Record<string, string | string[]> = Record<string, never>>(
    handler: RouteHandler<TParams>,
    options?: { name?: string; redact?: RedactOptions }
): RouteHandler<TParams> {
    const name = options?.name ?? handler.name ?? "anonymous";
    const redact = options?.redact ?? {};

    return async (request: NextRequest, context: RouteContext<TParams>) => {
        const start = performance.now();
        const reqInfo = await describeRequest(request, redact);

        console.log(`[${name}] request`, safeStringify(reqInfo));

        try {
            const res = await handler(request, context);
            const duration = performance.now() - start;
            const resInfo = await describeResponse(res, redact);
            console.log(`[${name}] response in ${duration.toFixed(2)}ms`, safeStringify(resInfo));
            return res;
        } catch (err) {
            const duration = performance.now() - start;
            console.error(`[${name}] threw after ${duration.toFixed(2)}ms`, err);
            throw err;
        }
    };
}

export { withLogging };
export type { RouteHandler, RouteContext, RedactOptions };