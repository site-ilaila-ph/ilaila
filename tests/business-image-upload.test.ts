import { describe, expect, it, vi } from "vitest";
import {
  BUSINESS_IMAGE_LIMIT,
  uploadBusinessImages,
  validateBusinessImageFiles,
} from "@/app/(session-gated)/(admin-only)/management/business-image-upload";

describe("business image upload rules", () => {
  it("rejects more than 10 files", () => {
    const files = Array.from({ length: BUSINESS_IMAGE_LIMIT + 1 }, (_, index) =>
      new File([`image-${index}`], `image-${index}.png`, { type: "image/png" }),
    );

    expect(() => validateBusinessImageFiles(files)).toThrow(/10/i);
  });

  it("uploads supported files and returns their public URLs", async () => {
    const files = [
      new File(["first"], "first.png", { type: "image/png" }),
      new File(["second"], "second.jpg", { type: "image/jpeg" }),
    ];

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ url: "/uploads/first.png" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ url: "/uploads/second.jpg" }) });

    const urls = await uploadBusinessImages(files, fetchMock as typeof fetch);

    expect(urls).toEqual(["/uploads/first.png", "/uploads/second.jpg"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
