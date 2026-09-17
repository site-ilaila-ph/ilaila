import { ValidationError, NotFoundError } from "@/lib/api/domain-errors";
import { Resource } from "@/entities";
import { acquireStorageManager } from "@/lib/storage";
import {
  listResources,
  findResourceById,
  createResource,
  deleteResourceById,
} from "@/repositories/resource-repository";

export async function listResourcesService() {
  return listResources();
}

export async function getResourceByIdService(id: string) {
  if (!id) throw new ValidationError({ code: "resource-id-required", detail: "A resource id is required." });
  const resource = await findResourceById(id);
  if (!resource) {
    throw new NotFoundError({ code: "resource-not-found", title: "Not Found", detail: "The resource does not exist." });
  }
  return resource;
}

export async function uploadResourceService(input: {
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

  return createResource({
    id: resourceId,
    name: input.name ?? resourceId,
    pathname: storedPathname,
    url,
    contentType,
    size: size ?? 0,
  });
}

export async function readResourceService(id: string) {
  const resource = await getResourceByIdService(id);
  const manager = acquireStorageManager();
  const meta = await manager.get({ key: resource.pathname ?? resource.id });
  return { resource, meta };
}

export async function deleteResourceService(id: string) {
  const resource = await getResourceByIdService(id);
  const manager = acquireStorageManager();
  if (resource.pathname) {
    await manager.delete({ key: resource.pathname });
  }
  await deleteResourceById(id);
  return { success: true };
}
