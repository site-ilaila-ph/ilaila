import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withDomainErrorBoundary } from "@/lib/api/boundary";
import { ValidationError } from "@/lib/api/domain-errors";
import { ok } from "@/lib/api/responses";

import { getFoodDetailService, deleteFoodService } from "@/services/food-service";
import { patchFoodService } from "@/services/food-patch";
import type { FoodPatchImageInput } from "@/repositories/food-repository";

export const runtime = "nodejs";

type PatchBody = {
  id: string;
  images?: FoodPatchImageInput[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

async function getFood(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  void req;
  const data = await getFoodDetailService((await params).id);
  return NextResponse.json(data, { status: 200 });
}

async function patchFood(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  const requireMultipart = contentType.includes("multipart/form-data");
  const fd = await req.formData();
  const metadataRaw = fd.get("metadata");
  if (typeof metadataRaw !== "string") {
    throw new ValidationError({ code: "metadata-required", detail: "A metadata JSON part is required." });
  }

  let body: PatchBody;
  try {
    body = JSON.parse(metadataRaw);
  } catch {
    throw new ValidationError({ code: "metadata-invalid-json", detail: "metadata part must be valid JSON." });
  }

  if (!body.id) {
    throw new ValidationError({ code: "food-id-required", detail: "A food id is required." });
  }

  const { id, images, ...foodFields } = body;
  const newFiles = new Map<string, Blob>();
  for (const [key, value] of fd.entries()) {
    if (key.startsWith("image:") && value instanceof Blob) newFiles.set(key, value);
  }

  const data = await patchFoodService({ id, foodFields, images, newFiles, requireMultipart });
  return ok(data);
}

async function deleteFood(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  await deleteFoodService(id ?? "");
  return NextResponse.json({ success: true }, { status: 200 });
}

import { adaptParams } from "@/lib/api/adapter";

export const GET = withLogging(withDomainErrorBoundary(adaptParams(getFood)), "getFood");
export const PATCH = withLogging(withDomainErrorBoundary(patchFood), "patchFood");
export const DELETE = withLogging(withDomainErrorBoundary(deleteFood), "deleteFood");
