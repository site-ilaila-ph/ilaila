export const BUSINESS_IMAGE_LIMIT = 10;

const allowedBusinessImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function validateManagedImageFiles(files: File[], maxCount = BUSINESS_IMAGE_LIMIT) {
  if (files.length > maxCount) {
    throw new Error(`You can upload up to ${maxCount} images.`);
  }

  for (const file of files) {
    if (!allowedBusinessImageTypes.has(file.type)) {
      throw new Error(`Unsupported image type: ${file.type}`);
    }

    if (file.size <= 0) {
      throw new Error(`Image file ${file.name} is empty.`);
    }
  }

  return files;
}

export function validateBusinessImageFiles(files: File[]) {
  return validateManagedImageFiles(files, BUSINESS_IMAGE_LIMIT);
}

export async function uploadManagedImages(
  files: File[],
  fetcher: typeof fetch = fetch,
  endpoint = "/api/uploads/business",
): Promise<string[]> {
  const validFiles = validateManagedImageFiles(files, BUSINESS_IMAGE_LIMIT);

  if (validFiles.length === 0) {
    return [];
  }

  const uploadedUrls: string[] = [];

  for (const file of validFiles) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetcher(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Image upload failed: ${message || response.statusText}`);
    }

    const result = (await response.json()) as { url?: string };
    if (!result.url) {
      throw new Error(`Upload response did not include a URL for ${file.name}.`);
    }

    uploadedUrls.push(result.url);
  }

  return uploadedUrls;
}

export async function uploadBusinessImages(
  files: File[],
  fetcher: typeof fetch = fetch,
): Promise<string[]> {
  return uploadManagedImages(files, fetcher, "/api/uploads/business");
}
