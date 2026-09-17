import { NextRequest, NextResponse } from "next/server";
import type { AnyRequestHandler } from "@/lib/next-types";

import { randomUUID } from "node:crypto";
import { join } from "node:path/posix";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquireDatabase } from "@/lib/infra";
import { acquireStorageManager } from "@/lib/storage";
import {
  badRequestProblem,
  conflictProblem,
  notFoundProblem,
  ok,
} from "@/lib/api/responses";
// import type { Business, BusinessImage } from "@/prisma/client";

type BusinessImageUpdate = Partial<Omit<BusinessImage, "id" | "businessId">>;

type BusinessImageRowToCreate = Omit<BusinessImage, "businessId">;

type PatchImageInput = BusinessImageUpdate & {
  id: string;
  /** Mark as a new image; a matching `image:<id>` file part is required. */
  new?: boolean;
  /** Mark an existing image for removal (row and stored object). */
  remove?: boolean;
};

type PatchBody = Partial<
  Omit<Business, "id" | "createdAt" | "updatedAt" | "createdBy" | "bookmarks" | "foods" | "images" | "tags" | "menuItems" | "reviews">
> & {
  /** When present, must match the URL param `id`. */
  id?: string;
  images?: PatchImageInput[];
};

export const runtime = "nodejs";

function mapBusinessDetailError(req: NextRequest, error: unknown): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem(req, {
      code: "invalid-json",
      title: "Maling Request",
      detail: "Ang request body ay dapat na valid JSON.",
    });
  }

  if (error instanceof Error) {
    if ((error as Error & { code?: string }).code === "P2025") {
      return notFoundProblem(req, {
        code: "business-not-found",
        title: "Hindi Nakita",
        detail: "Ang negosyo ay hindi umiiral.",
      });
    }

    if ((error as Error & { code?: string }).code === "P2002") {
      return conflictProblem(req, {
        code: "business-conflict",
        title: "Salungatan",
        detail: "Mayroon nang negosyo na may parehong mga field.",
      });
    }

    if ((error as Error & { code?: string }).code === "P2003") {
      return badRequestProblem(req, {
        code: "business-invalid-reference",
        title: "Maling Request",
        detail: "Ang negosyo ay nagre-record ng record na hindi umiiral.",
      });
    }
  }

  throw error;
}

async function getBusiness(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = acquireDatabase();
  const id = (await params).id;

  const business = await db.business.findUnique({
    where: { id },
    include: {
      images: true,
      createdBy: true,
      reviews: {
        orderBy: { createdAt: "desc" },
      },
      foods: true,
    },
  });

  if (!business) {
    return notFoundProblem(req, {
      code: "business-not-found",
      title: "Hindi Nakita",
      detail: "Ang negosyo ay hindi umiiral.",
    });
  }

  return NextResponse.json(business, { status: 200 });
}

async function patchBusiness(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return badRequestProblem(req, {
      code: "multipart-required",
      detail: "PATCH requires multipart/form-data with a 'metadata' part.",
    });
  }

  const db = acquireDatabase();
  const urlId = (await params).id;

  let businessId: string | undefined;
  const newlyCreatedImageIds: string[] = [];

  try {
    const fd = await req.formData();
    const metadataRaw = fd.get("metadata");
    if (typeof metadataRaw !== "string") {
      return badRequestProblem(req, { code: "metadata-required", detail: "A metadata JSON part is required." });
    }

    let body: PatchBody;
    try {
      body = JSON.parse(metadataRaw);
    } catch {
      return badRequestProblem(req, { code: "metadata-invalid-json", detail: "metadata part must be valid JSON." });
    }

    // The business id must come from the URL param (RESTful) or, for backward
    // compatibility, from the metadata body. If both are present they must
    // agree.
    const bodyId = body.id;
    if (bodyId && bodyId !== urlId) {
      return badRequestProblem(req, {
        code: "business-id-mismatch",
        detail: "The metadata id must match the URL business id.",
      });
    }
    businessId = urlId;

    const { images, ...businessFields } = body;

    const toUpdate = images?.filter((img) => !img.new && !img.remove) ?? [];
    const toCreate = images?.filter((img) => img.new) ?? [];
    const toRemove = images?.filter((img) => img.remove) ?? [];

    // Validate any referenced images actually belong to this business before
    // touching storage/DB.
    const referencedIds = [...toUpdate, ...toRemove].map((img) => img.id);
    if (referencedIds.length > 0) {
      const existingImages = await db.businessImage.findMany({
        where: { id: { in: referencedIds }, businessId: businessId },
        select: { id: true },
      });
      const foundIds = new Set(existingImages.map((img: { id: string }) => img.id));
      const missing = referencedIds.filter((imageId) => !foundIds.has(imageId));
      if (missing.length > 0) {
        return badRequestProblem(req, {
          code: "image-not-found",
          detail: `Image(s) not found for this business: ${missing.join(", ")}`,
        });
      }
    }

    const storageManager = acquireStorageManager();

    // Validate before uploading so a single missing file cannot orphan the
    // uploads of its siblings.
    for (const img of toCreate) {
      if (!(fd.get(`image:${img.id}`) instanceof Blob)) {
        return badRequestProblem(req, {
          code: "image-file-required",
          detail: `A file is required for new image '${img.id}'.`,
        });
      }
    }

    // New images: upload each file and record the row to create.
    const imagesToCreate: BusinessImageRowToCreate[] = [];
    for (const img of toCreate) {
      const file = fd.get(`image:${img.id}`) as File;
      const newImageId = randomUUID();
      const { url } = await storageManager.upload({
        key: join("businesses", businessId, "images", newImageId),
        fileOrBody: file,
        options: { contentType: file.type },
      });
      newlyCreatedImageIds.push(newImageId);
      imagesToCreate.push({
        id: newImageId,
        description: img.description ?? "",
        url,
      });
    }

    // Existing images: replace the file when an `image:<id>` part is present.
    const imageUpdates = await Promise.all(
      toUpdate.map(async (img) => {
        const file = fd.get(`image:${img.id}`);
        const updatedFile =
          file instanceof Blob
            ? await storageManager.upload({
                key: join("businesses", businessId!, "images", img.id!),
                fileOrBody: file,
                options: { contentType: file.type },
              })
            : null;
        const data: BusinessImageUpdate = {
          ...(img.description !== undefined ? { description: img.description } : {}),
        };
        if (updatedFile) data.url = updatedFile.url;
        return {
          where: { id: img.id! },
          data,
        };
      })
    );

    const updatedBusiness = await db.$transaction(async (tx: TransactionClient) => {
      const _updated = await tx.business.update({
        where: { id: (await params).id },
        data: {
          ...businessFields,
          images:
            imageUpdates.length > 0 ||
            imagesToCreate.length > 0 ||
            toRemove.length > 0
              ? {
                  update: imageUpdates.length > 0 ? imageUpdates : undefined,
                  create: imagesToCreate.length > 0 ? imagesToCreate : undefined,
                  deleteMany:
                    toRemove.length > 0
                      ? { id: { in: toRemove.map((img) => img.id) } }
                      : undefined,
                }
              : undefined,
        },
        include: { images: true },
      });
      return _updated;
    });

    // Remove the stored files of deleted images only after the transaction
    // commits, so a failed write never destroys referenced objects.
    const removals = await Promise.allSettled(
      toRemove.map((img) =>
        storageManager.delete({ key: join("businesses", businessId!, "images", img.id!) })
      )
    );
    removals.forEach((result) => {
      if (result.status === "rejected") {
        console.error("patchBusiness: failed to remove image object", result.reason);
      }
    });

    return ok(updatedBusiness);
  } catch (error: unknown) {
    // If an upload/transaction failed, remove any newly uploaded files so they
    // don't become orphaned objects.
    if (businessId && newlyCreatedImageIds.length > 0) {
      const storageManager = acquireStorageManager();
      const targetBusinessId = businessId;
      await Promise.allSettled(
        newlyCreatedImageIds.map((imageId) =>
          storageManager.delete({ key: join("businesses", targetBusinessId, "images", imageId) })
        )
      );
    }
    return mapBusinessDetailError(req, error);
  }
}

async function deleteBusiness(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!id) return badRequestProblem(req, { code: "business-id-required", detail: "A business id is required." });
    const db = acquireDatabase();
    const storageManager = acquireStorageManager();

    // Collect every storage key that may belong to this business: the objects
    // referenced by its BusinessImage rows plus any stray objects under the
    // business's folder (e.g. leftovers from earlier failures).
    const keysToDelete = new Set<string>();
    const imageRows = await db.businessImage.findMany({
      where: { businessId: id },
      select: { id: true },
    });
    imageRows.forEach((img: { id: string }) =>
      keysToDelete.add(join("businesses", id, "images", img.id))
    );
    for (const folder of [join("businesses", id), join("businesses", id, "images")]) {
      const { blobs } = await storageManager.list({ prefix: folder });
      blobs.forEach((blob: { pathname: string }) => keysToDelete.add(blob.pathname));
    }

    // Remove objects first (best-effort) so no orphaned files are left behind,
    // then delete the DB record even if a storage removal failed.
    const removals = await Promise.allSettled(
      [...keysToDelete].map((key) => storageManager.delete({ key }))
    );
    removals.forEach((result) => {
      if (result.status === "rejected") {
        console.error("deleteBusiness: failed to remove storage object", result.reason);
      }
    });

    await db.business.delete({ where: { id: id! } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return mapBusinessDetailError(req, error);
  }
}

// Adapt handlers that destructure { params } to the (req, params) shape
// expected by withLogging / withUnhandledApiErrorHandling.
function adaptParams(
  fn: (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => Promise<NextResponse>,
): AnyRequestHandler {
  return async (request: NextRequest, ctx: { params: Promise<{ id: string }> }) => fn(request, ctx);
}

export const GET = withLogging(
  withUnhandledApiErrorHandling(adaptParams(getBusiness)),
  "getBusiness",
);
export const PATCH = withLogging(
  withUnhandledApiErrorHandling(adaptParams(patchBusiness)),
  "patchBusiness",
);

export const DELETE = withLogging(
  withUnhandledApiErrorHandling(adaptParams(deleteBusiness)),
  "deleteBusiness",
);
export type TransactionClient = any;
type Business = any; type BusinessImage = any;
