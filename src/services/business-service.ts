import type { ListOptions } from "@/lib/api/list-options";
import { ValidationError, NotFoundError } from "@/lib/api/domain-errors";
import type { Prisma } from "@/generated/prisma/client";
import {
  listBusinesses,
  findBusinessByIdOrName,
  findBusinessDetailById,
  createBusinessWithImages,
  createSimpleBusiness,
  updateSimpleBusiness,
  deleteBusinessById,
  findBusinessImageIds,
} from "@/repositories/business-repository";
import { findFirstUserId } from "@/repositories/user-repository";
import { uploadImages, assertImagesMatchFiles, cleanupUploadedImages, collectEntityStorageKeys, deleteStorageKeys } from "./image-upload-service";

export async function listBusinessesService(options: ListOptions, opts?: { includeUnpublished?: boolean }) {
  return listBusinesses(options, opts);
}

export async function getBusinessDetailService(id: string) {
  if (!id) throw new ValidationError({ code: "business-id-required", detail: "A business id is required." });
  const business = await findBusinessDetailById(id);
  if (!business) {
    throw new NotFoundError({ code: "business-not-found", title: "Hindi Nakita", detail: "Ang negosyo ay hindi umiiral." });
  }
  return business;
}

export async function getBusinessByIdOrNameService(idOrName: string) {
  if (!idOrName) throw new ValidationError({ code: "business-id-required", detail: "A business id is required." });
  const data = await findBusinessByIdOrName(idOrName);
  if (!data) {
    throw new NotFoundError({ code: "business-not-found", detail: "The business does not exist." });
  }
  return data;
}

export async function createBusinessService(input: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  businessFields: Record<string, any>;
  ownerId?: string;
  imagesMeta?: Array<Record<string, unknown>>;
  imageFiles?: Blob[];
}) {
  const businessFields = { ...input.businessFields };
  delete (businessFields as Record<string, unknown>).createdBy;
  let ownerId = input.ownerId;
  if (!ownerId) {
    const fallback = await findFirstUserId();
    if (!fallback) {
      throw new ValidationError({
        code: "business-owner-required",
        detail: "A user profile must exist before a business can be created.",
      });
    }
    ownerId = fallback;
  }
  const metas = input.imagesMeta ?? [];
  const files = input.imageFiles ?? [];
  assertImagesMatchFiles(metas, files, "business create");
  const businessId = crypto.randomUUID();
  const uploaded = await uploadImages({
    folder: "businesses",
    parentId: businessId,
    files: files.map((blob, i) => ({ blob, meta: metas[i] })),
  });
  try {
    return await createBusinessWithImages({
      id: businessId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fields: businessFields as any,
      ownerId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      images: uploaded as any,
    });
  } catch (err) {
    await cleanupUploadedImages({ folder: "businesses", parentId: businessId, imageIds: uploaded.map((u) => u.id) });
    throw err;
  }
}

export async function createSimpleBusinessService(input: Omit<Prisma.BusinessUncheckedCreateInput, "createdById" | "id">) {
  if (!input.name) {
    throw new ValidationError({ code: "business-name-required", detail: "A business name is required." });
  }
  const ownerId = await findFirstUserId();
  if (!ownerId) {
    throw new ValidationError({
      code: "business-owner-required",
      detail: "A user profile must exist before a business can be created.",
    });
  }
  return createSimpleBusiness({ ...input, ownerId });
}

export async function updateSimpleBusinessService(input: Prisma.BusinessUncheckedUpdateInput & { id: string }) {
  if (!input.id) throw new ValidationError({ code: "business-id-required", detail: "A business id is required." });
  return updateSimpleBusiness(input);
}

export async function deleteBusinessService(id: string) {
  if (!id) throw new ValidationError({ code: "business-id-required", detail: "A business id is required." });
  const imageIds = await findBusinessImageIds(id);
  const keys = await collectEntityStorageKeys({ folder: "businesses", parentId: id, knownIds: imageIds });
  await deleteStorageKeys(keys);
  return deleteBusinessById(id);
}
