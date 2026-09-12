import { acquirePrismaClient, acquireStorageManager } from "@/lib/infra";
import type { StorageMetadata } from "@/lib/infra/storage/common";
import { createClient } from "@/lib/supabase/server";
import { createUploadRecord, getUploadRecordById, markUploadRecordCompleted, UploadStatus } from "@/lib/uploads";
import {
  badRequestProblem,
  badGatewayProblem,
  forbiddenProblem,
  internalErrorProblem,
  notFoundProblem,
  ok,
  unauthorizedProblem,
  unsupportedMediaTypeProblem,
} from "../responses";

export interface UploadPreparation {
    uploadUrl: string;
    pathname: string;
    uploadId: string;
}

type UploadMap = Record<string, UploadPreparation>;

export type ResolvedUploadMap = Record<string, StorageMetadata>;

export type UploadHandler = (
    request: Request,
    uploads: ResolvedUploadMap,
) => Promise<Response>;

const UPLOAD_MEDIA_TYPE = "application/uploads+json";
const JSON_MEDIA_TYPE = "application/json";

function getContentType(request: Request): string {
    return request.headers.get("content-type")?.split(";")[0].trim() ?? "";
}

function hasRequiredUploadNames(
    uploads: Record<string, unknown>,
    requiredUploadNames: string[],
): boolean {
    for (const name of requiredUploadNames) {
        if (!(name in uploads)) {
            return false;
        }
    }

    return true;
}

function getUploadKey(
    uploadName: string,
    uploadId: string,
): string {
    return `uploads/${uploadId}/${uploadName}`;
}

/**
 * Adds direct-upload support to a route.
 *
 * First request:
 *
 * POST /api/example
 * Content-Type: application/uploads+json
 *
 * -> returns upload targets
 *
 * Second request:
 *
 * POST /api/example
 * Content-Type: application/json
 *
 * { "image": "<upload-id>" }
 *
 * -> resolves uploads and calls the actual handler.
 */
export function withUpload(
    handler: UploadHandler,
    requiredUploadNames: string[],
) {
    return async function uploadRoute(
        request: Request,
    ): Promise<Response> {
        const contentType = getContentType(request);

        if (contentType === UPLOAD_MEDIA_TYPE) {
            return handleUploadPreparation(
                request,
                requiredUploadNames,
            );
        }

        if (contentType === JSON_MEDIA_TYPE) {
            return handleUploadExecution(
                request,
                requiredUploadNames,
                handler,
            );
        }

        return unsupportedMediaTypeProblem(
            request,
            {
                code: "upload-unsupported-media-type",
                detail: `Expected "${UPLOAD_MEDIA_TYPE}" or "${JSON_MEDIA_TYPE}".`,
            });
    };
}

async function resolveUploadOwnerId(request: Request): Promise<{ userId: string } | Response> {
    let userId: string;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return unauthorizedProblem(request, { code: "upload-unauthorized", detail: "Authentication required to upload files." });
        }

        const db = acquirePrismaClient();
        const userData = await db.userData.findUnique({
            select: { id: true },
            where: { authId: user.id },
        });

        if (!userData) {
            return forbiddenProblem(request, { code: "upload-profile-required", detail: "No user profile exists for the current user." });
        }

        userId = userData.id;
    } catch (error: unknown) {
        console.error("Upload owner lookup failed", error);
        return internalErrorProblem(request, { detail: "Unable to verify the upload owner right now. Please try again later." });
    }

    return { userId };
}

function mapUploadPreparationFailure(request: Request, error: unknown): Response {
    if (isStorageError(error)) {
        return badGatewayProblem(request, { code: "upload-storage-unavailable", detail: error.message });
    }

    console.error("Upload preparation failed", error);
    return internalErrorProblem(request, { detail: "Unable to prepare uploads right now. Please try again later." });
}

function mapUploadResolutionFailure(request: Request, error: unknown): Response {
    if (isStorageError(error)) {
        return badGatewayProblem(request, { code: "upload-storage-unavailable", detail: error.message });
    }

    console.error("Upload resolution failed", error);
    return internalErrorProblem(request, { detail: "Unable to verify uploads right now. Please try again later." });
}

function isStorageError(error: unknown): error is Error {
    return (
        error instanceof Error &&
        (/supabase|storage|s3|bucket|upload/i.test(error.message) ||
            /signed|credentials|bucket/i.test(error.name))
    );
}

async function handleUploadPreparation(
    request: Request,
    requiredUploadNames: string[],
): Promise<Response> {
    let body: Record<string, unknown>;

    try {
        body = await request.json();
    } catch {
        return badRequestProblem(request, { code: "upload-invalid-body", detail: "The request body must contain valid JSON." });
    }

    if (
        typeof body !== "object" ||
        body === null ||
        Array.isArray(body)
    ) {
        return badRequestProblem(request, { code: "upload-invalid-body", detail: "The request body must be a JSON object." });
    }

    if (!hasRequiredUploadNames(body, requiredUploadNames)) {
        return badRequestProblem(request, { code: "upload-missing", detail: "One or more required uploads were not provided." });
    }

    const owner = await resolveUploadOwnerId(request);

    if (owner instanceof Response) {
        return owner;
    }

    try {
        const storage = acquireStorageManager();

        const uploads: UploadMap = {};

        for (const uploadName of requiredUploadNames) {
            const uploadId = crypto.randomUUID();
            const pathname = getUploadKey(
                uploadName,
                uploadId,
            );

            const upload = await storage.createUpload({
                key: pathname,
                options: {
                    contentType: getRequestedContentType(
                        body[uploadName],
                    ),
                },
            });

            await createUploadRecord({
                id: uploadId,
                pathname: upload.pathname,
                uploadName,
                userId: owner.userId,
                status: UploadStatus.Pending,
            });

            uploads[uploadName] = {
                ...upload,
                uploadId,
            };
        }

        return ok(uploads);
    } catch (error: unknown) {
        return mapUploadPreparationFailure(request, error);
    }
}

async function handleUploadExecution(
    request: Request,
    requiredUploadNames: string[],
    handler: UploadHandler,
): Promise<Response> {
    let body: Record<string, unknown>;

    try {
        // Clone so the inner handler can still read the request body.
        body = await request.clone().json();
    } catch {
        return badRequestProblem(request, { code: "upload-invalid-body", detail: "The request body must contain valid JSON." });
    }

    if (
        typeof body !== "object" ||
        body === null ||
        Array.isArray(body)
    ) {
        return badRequestProblem(request, { code: "upload-invalid-body", detail: "The request body must be a JSON object." });
    }

    if (!hasRequiredUploadNames(body, requiredUploadNames)) {
        return badRequestProblem(request, { code: "upload-missing", detail: "One or more required uploads were not provided." });
    }

    const owner = await resolveUploadOwnerId(request);

    if (owner instanceof Response) {
        return owner;
    }

    try {
        const uploads: ResolvedUploadMap = {};
        const storage = acquireStorageManager();

        for (const uploadName of requiredUploadNames) {
            const uploadId = body[uploadName];

            if (typeof uploadId !== "string") {
                return badRequestProblem(request, { code: "upload-invalid-id", detail: `Upload "${uploadName}" must contain an upload ID.` });
            }

            const uploadRecord = await getUploadRecordById(uploadId);

            if (!uploadRecord) {
                return notFoundProblem(request, { code: "upload-not-found", detail: `Upload "${uploadName}" does not exist.` });
            }

            if (uploadRecord.uploadName !== uploadName) {
                return badRequestProblem(request, { code: "upload-mismatch", detail: `Upload "${uploadName}" does not match the prepared upload.` });
            }

            if (uploadRecord.userId !== owner.userId) {
                return forbiddenProblem(request, { code: "upload-forbidden", detail: `Upload "${uploadName}" does not belong to the current user.` });
            }

            if (uploadRecord.status !== UploadStatus.Pending) {
                return badRequestProblem(request, { code: "upload-already-used", detail: `Upload "${uploadName}" has already been used.` });
            }

            const metadata = await storage.get({
                key: uploadRecord.pathname,
            });

            if (!metadata) {
                return badRequestProblem(request, { code: "upload-incomplete", detail: `Upload "${uploadName}" has not been uploaded.` });
            }

            await markUploadRecordCompleted(uploadId);

            uploads[uploadName] = metadata;
        }

        return handler(request, uploads);
    } catch (error: unknown) {
        return mapUploadResolutionFailure(request, error);
    }
}

function getRequestedContentType(
    value: unknown,
): string | undefined {
    if (
        typeof value !== "object" ||
        value === null ||
        Array.isArray(value)
    ) {
        return undefined;
    }

    if (!("contentType" in value)) {
        return undefined;
    }

    const contentType = value.contentType;

    return typeof contentType === "string"
        ? contentType
        : undefined;
}