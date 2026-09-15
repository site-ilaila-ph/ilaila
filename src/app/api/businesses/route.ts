import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { join } from "node:path/posix";
import type { BusinessCreateInput, BusinessImageCreateInput } from "@/generated/prisma/models";
import { Prisma } from "@/generated/prisma/client";
import { withLogging } from "@/lib/logging";
import { isMissingIdError, withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient, acquireStorageManager } from "@/lib/infra";
import { badRequestProblem, conflictProblem, notFoundProblem, ok } from "@/lib/api/responses";
import { parseListOptions, type ListOptionsError } from "@/lib/api/list-options";
import { listBusinesses, sortableFields, filterableFields, includeableRelations } from "@/lib/repos/business";


export const runtime = "nodejs";

async function getBusinesses(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const db = acquirePrismaClient();
  if (id) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let data = null;

    if (isUuid) {
      data = await db.business.findUnique({
        where: { id },
        include: {
          images: true,
          tags: true,
          reviews: { include: { user: { include: { authUser: true } } } },
          menuItems: true,
          foods: { include: { food: { include: { images: true } } } },
        },
      });
    }

    if (!data) {
      const decoded = decodeURIComponent(id).replaceAll("-", " ");
      data = await db.business.findFirst({
        where: {
          OR: [
            { name: { equals: id, mode: "insensitive" } },
            { name: { equals: decoded, mode: "insensitive" } },
            { name: { contains: id, mode: "insensitive" } },
          ],
        },
        include: {
          images: true,
          tags: true,
          reviews: { include: { user: { include: { authUser: true } } } },
          menuItems: true,
          foods: { include: { food: { include: { images: true } } } },
        },
      });
    }

    if (!data) {
      return notFoundProblem(req, { code: "business-not-found", detail: "The business does not exist." });
    }

    return NextResponse.json(data, { status: 200 });
  }

  try {
    const options = parseListOptions(
      req.nextUrl.searchParams,
      sortableFields,
      filterableFields,
      includeableRelations,
    );
    const data = await listBusinesses(options);
    return ok(data);
  } catch (err) {
    if (err instanceof ListOptionsError) {
      return badRequestProblem(req, {
        code: "bad-list-options",
        title: "Maling Request",
        detail: err.message,
      });
    }
    throw err;
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getBusinesses), "getBusinesses");

type CreateMetadata = {
  business: Omit<BusinessCreateInput, "createdBy" | "createdById"> & {
    createdBy?: unknown;
    createdById?: string;
  };
  images?: BusinessImageCreateInput[];
};

function mapBusinessPrismaError(req: NextRequest, error: unknown): NextResponse {
  if (error instanceof SyntaxError) {
    return badRequestProblem(req, {
      code: "invalid-json",
      title: "Maling Request",
      detail: "Ang request body ay dapat na valid JSON.",
    });
  }

  if (isMissingIdError(error)) {
    return badRequestProblem(req, {
      code: "business-id-required",
      title: "Maling Request",
      detail: "Kinakailangan ng business id.",
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return notFoundProblem(req, {
        code: "business-not-found",
        title: "Hindi Nakita",
        detail: "Ang negosyo ay hindi umiiral.",
      });
    }

    if (error.code === "P2002") {
      return conflictProblem(req, {
        code: "business-conflict",
        title: "Salungatan",
        detail: "Mayroon nang negosyo na may parehong mga field.",
      });
    }

    if (error.code === "P2003") {
      return badRequestProblem(req, {
        code: "business-invalid-reference",
        title: "Maling Request",
        detail: "Ang negosyo ay nagre-record ng record na hindi umiiral.",
      });
    }
  }

  throw error;
}

async function createBusiness(req: NextRequest) {
  const fd = await req.formData();
  const metadataRaw = fd.get("metadata");

  if (typeof metadataRaw !== "string") {
    return badRequestProblem(req, { code: "metadata-required", detail: "A metadata JSON part is required." });
  }

  let parsed: CreateMetadata;
  try {
    parsed = JSON.parse(metadataRaw);
  } catch {
    return badRequestProblem(req, { code: "metadata-invalid-json", detail: "metadata part must be valid JSON." });
  }

  if (!parsed?.business) {
    return badRequestProblem(req, { code: "business-required", detail: "metadata.business is required." });
  }

  const imageFiles = fd.getAll("images").filter((f): f is File => f instanceof File);
  const imagesMeta = parsed.images ?? [];

  if (imagesMeta.length > 0 && imagesMeta.length !== imageFiles.length) {
    return badRequestProblem(req, {
      code: "images-files-mismatch",
      detail: `metadata.images has ${imagesMeta.length} entries but ${imageFiles.length} image files were uploaded.`,
    });
  }

  // Business rows require an owner; fall back to the first user profile when
  // the caller did not supply one (same behavior as the management route).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdBy: _createdBy, createdById, ...businessFields } = parsed.business;
  let ownerId = typeof createdById === "string" ? createdById : undefined;

  if (!ownerId) {
    const db = acquirePrismaClient();
    const defaultOwner = await db.userData.findFirst({ select: { id: true } });
    if (!defaultOwner) {
      return badRequestProblem(req, {
        code: "business-owner-required",
        detail: "A user profile must exist before a business can be created.",
      });
    }
    ownerId = defaultOwner.id;
  }

  let businessId: string | undefined;
  let uploadedBusinessImageIds: string[] = [];

  try {
    const db = acquirePrismaClient();
    businessId = randomUUID();
    const storageManager = acquireStorageManager();
    const targetBusinessId = businessId;
    const ownerIdForCreate = ownerId;

    const uploaded = await Promise.all(
      imageFiles.map(async (blob, i) => {
        const businessImageId = randomUUID();
        const { url } = await storageManager.upload({
          key: join("businesses", targetBusinessId, "images", businessImageId),
          fileOrBody: blob,
          options: { contentType: blob.type },
        });
        return {
          ...(imagesMeta[i] ?? {}),
          id: businessImageId,
          url,
        };
      })
    );
    uploadedBusinessImageIds = uploaded.map((image) => image.id);

    const business = await db.business.create({
      data: {
        id: businessId,
        ...businessFields,
        createdById: ownerIdForCreate,
        images: uploaded.length > 0 ? { create: uploaded } : undefined,
      },
      include: { images: true },
    });

    return ok(business);
  } catch (error: unknown) {
    // Do not leave orphaned objects behind if the DB write fails.
    if (businessId && uploadedBusinessImageIds.length > 0) {
      const storageManager = acquireStorageManager();
      const targetBusinessId = businessId;
      await Promise.allSettled(
        uploadedBusinessImageIds.map((imageId) =>
          storageManager.delete({ key: join("businesses", targetBusinessId, "images", imageId) })
        )
      );
    }
    return mapBusinessPrismaError(req, error);
  }
}

export const POST = withLogging(withUnhandledApiErrorHandling(createBusiness), "createBusiness");

