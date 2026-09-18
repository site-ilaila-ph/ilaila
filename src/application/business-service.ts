import { injectable, inject } from "inversify";
import type { ListOptions } from "@/lib/api/list-options";
import { ValidationError, NotFoundError } from "@/lib/api/domain-errors";
import { BusinessRepository } from "@/repositories/business-repository";
import { UserRepository } from "@/repositories/user-repository";
import { uploadImages, assertImagesMatchFiles, cleanupUploadedImages, collectEntityStorageKeys, deleteStorageKeys } from "./image-upload-service";
import { Business } from "@/entities";

@injectable()
export class BusinessService {
  constructor(
    @inject("BusinessRepository") private repo: BusinessRepository,
    @inject("UserRepository") private userRepo: UserRepository,
  ) {}

  async listBusinessesService(options: ListOptions, opts?: { includeUnpublished?: boolean }) {
    return this.repo.listBusinesses(options, opts);
  }

  async getBusinessDetailService(id: string) {
    if (!id) throw new ValidationError({ code: "business-id-required", detail: "A business id is required." });
    const business = await this.repo.findBusinessDetailById(id);
    if (!business) {
      throw new NotFoundError({ code: "business-not-found", title: "Hindi Nakita", detail: "Ang negosyo ay hindi umiiral." });
    }
    return business;
  }

  async getBusinessByIdOrNameService(idOrName: string) {
    if (!idOrName) throw new ValidationError({ code: "business-id-required", detail: "A business id is required." });
    const data = await this.repo.findBusinessByIdOrName(idOrName);
    if (!data) {
      throw new NotFoundError({ code: "business-not-found", detail: "The business does not exist." });
    }
    return data;
  }

  async createBusinessService(input: {
    businessFields: Partial<Omit<Business, "id" | "createdAt" | "updatedAt" | "createdById" | "bookmarks" | "foods" | "images" | "tags" | "menuItems" | "reviews">>;
    ownerId?: string;
    imagesMeta?: Array<Partial<BusinessImage>>;
    imageFiles?: Blob[];
  }) {
    const businessFields = { ...input.businessFields } as Partial<Business>;
    delete (businessFields as Partial<Business>).createdBy;
    let ownerId = input.ownerId;
    if (!ownerId) {
      const fallback = await this.userRepo.findFirstUserId();
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
      return await this.repo.createBusinessWithImages({
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

  async createSimpleBusinessService(input: Omit<BusinessUncheckedCreateInput, "createdById" | "id">) {
    if (!input.name) {
      throw new ValidationError({ code: "business-name-required", detail: "A business name is required." });
    }
    const ownerId = await this.userRepo.findFirstUserId();
    if (!ownerId) {
      throw new ValidationError({
        code: "business-owner-required",
        detail: "A user profile must exist before a business can be created.",
      });
    }
    return this.repo.createSimpleBusiness({ ...input, ownerId });
  }

  async updateSimpleBusinessService(input: BusinessUncheckedUpdateInput & { id: string }) {
    if (!input.id) throw new ValidationError({ code: "business-id-required", detail: "A business id is required." });
    return this.repo.updateSimpleBusiness(input);
  }

  async deleteBusinessService(id: string) {
    if (!id) throw new ValidationError({ code: "business-id-required", detail: "A business id is required." });
    const imageIds = await this.repo.findBusinessImageIds(id);
    const keys = await collectEntityStorageKeys({ folder: "businesses", parentId: id, knownIds: imageIds });
    await deleteStorageKeys(keys);
    return this.repo.deleteBusinessById(id);
  }
}
export type BusinessUncheckedCreateInput = Partial<Omit<Business, "id" | "createdAt" | "updatedAt" | "createdById" | "bookmarks" | "foods" | "images" | "tags" | "menuItems" | "reviews">>;
export type BusinessUncheckedUpdateInput = Partial<Omit<Business, "id" | "createdAt" | "updatedAt" | "createdById" | "bookmarks" | "foods" | "images" | "tags" | "menuItems" | "reviews">>;
