import { injectable, inject } from "inversify";
import { ValidationError, NotFoundError } from "@/lib/api/domain-errors";
import { Resource } from "@/entities";
import { acquireStorageManager } from "@/lib/storage";
import { ResourceRepository } from "@/repositories/resource-repository";

@injectable()
export class ResourceService {
  constructor(@inject("ResourceRepository") private repo: ResourceRepository) {}

  async listResourcesService() {
    return this.repo.listResources();
  }

  async getResourceByIdService(id: string) {
    if (!id) throw new ValidationError({ code: "resource-id-required", detail: "A resource id is required." });
    const resource = await this.repo.findResourceById(id);
    if (!resource) {
      throw new NotFoundError({ code: "resource-not-found", title: "Not Found", detail: "The resource does not exist." });
    }
    return resource;
  }

  async uploadResourceService(input: {
    file: Blob;
    folder?: string;
    name?: string;
  }): Promise<Resource> {
    const storage = acquireStorageManager();
    const folder = input.folder ?? "resources";
    const resourceId = crypto.randomUUID();
    const pathname = `${folder}/${resourceId}/${input.name ?? resourceId}`;

    const { url, pathname: storedPathname, contentType, size } = await storage.upload({
      key: pathname,
      fileOrBody: input.file,
      options: { contentType: input.file.type },
    });

    return this.repo.createResource({
      id: resourceId,
      name: input.name ?? resourceId,
      pathname: storedPathname,
      url,
      contentType,
      size: size ?? 0,
    });
  }

  async readResourceService(id: string) {
    const resource = await this.getResourceByIdService(id);
    const manager = acquireStorageManager();
    const meta = await manager.get({ key: resource.pathname ?? resource.id });
    return { resource, meta };
  }

  async deleteResourceService(id: string) {
    const resource = await this.getResourceByIdService(id);
    const manager = acquireStorageManager();
    if (resource.pathname) {
      await manager.delete({ key: resource.pathname });
    }
    await this.repo.deleteResourceById(id);
    return { success: true };
  }
}
