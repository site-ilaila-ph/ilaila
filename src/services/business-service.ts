import type { ListOptions } from "@/lib/api/list-options";
import { ValidationError, NotFoundError } from "@/lib/api/domain-errors";

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
import { Business } from "@/entities";

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
  businessFields: Partial<Omit<Business, "id" | "createdAt" | "updatedAt" | "createdById" | "bookmarks" | "foods" | "images" | "tags" | "menuItems" | "reviews">>;
  ownerId?: string;
  imagesMeta?: Array<Partial<BusinessImage>>;
  imageFiles?: Blob[];
}) {
  const businessFields = { ...input.businessFields } as Partial<Business>;
  delete (businessFields as Partial<Business>).createdBy;
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
      fields: businessFields,
      ownerId,
      images: uploaded,
    });
  } catch (err) {
    await cleanupUploadedImages({ folder: "businesses", parentId: businessId, imageIds: uploaded.map((u) => u.id) });
    throw err;
  }
}

export async function createSimpleBusinessService(input: Omit<BusinessUncheckedCreateInput, "createdById" | "id">) {
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

export async function updateSimpleBusinessService(input: BusinessUncheckedUpdateInput & { id: string }) {
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
export type BusinessUncheckedCreateInput = Partial<Omit<Business, "id" | "createdAt" | "updatedAt" | "createdById" | "bookmarks" | "foods" | "images" | "tags" | "menuItems" | "reviews">>;
export type BusinessUncheckedUpdateInput = Partial<Omit<Business, "id" | "createdAt" | "updatedAt" | "createdById" | "bookmarks" | "foods" | "images" | "tags" | "menuItems" | "reviews">>;
