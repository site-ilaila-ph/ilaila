import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withDomainErrorBoundary } from "@/lib/api/boundary";
import { ValidationError } from "@/lib/api/domain-errors";

import { ok } from "@/lib/api/responses";
import { parseListOptions, ListOptionsError } from "@/lib/api/list-options";
import { sortableFields, filterableFields, includeableRelations } from "@/repositories/business-repository";
import { getBusinessByIdOrNameService, listBusinessesService, createBusinessService } from "@/services/business-service";


export const runtime = "nodejs";

async function getBusinesses(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    const data = await getBusinessByIdOrNameService(id);
    return NextResponse.json(data, { status: 200 });
  }

  try {
    const options = parseListOptions(
      req.nextUrl.searchParams,
      sortableFields,
      filterableFields,
      includeableRelations,
    );
    const data = await listBusinessesService(options);
    return ok(data);
  } catch (err) {
    if (err instanceof ListOptionsError) {
      throw new ValidationError({ code: "bad-list-options", detail: err.message });
    }
    throw err;
  }
}

export const GET = withLogging(withDomainErrorBoundary(getBusinesses), "getBusinesses");

type CreateMetadata = {
  business: Omit<BusinessUncheckedCreateInput, "createdById" | "id"> & {
    createdBy?: unknown;
    createdById?: string;
  };
  images?: Array<Record<string, unknown>>;
};

async function createBusiness(req: NextRequest) {
  const fd = await req.formData();
  const metadataRaw = fd.get("metadata");

  if (typeof metadataRaw !== "string") {
    throw new ValidationError({ code: "metadata-required", detail: "A metadata JSON part is required." });
  }

  let parsed: CreateMetadata;
  try {
    parsed = JSON.parse(metadataRaw);
  } catch {
    throw new ValidationError({ code: "metadata-invalid-json", detail: "metadata part must be valid JSON." });
  }

  if (!parsed?.business) {
    throw new ValidationError({ code: "business-required", detail: "metadata.business is required." });
  }

  const imageFiles = fd.getAll("images").filter((f): f is File => f instanceof File);
  const imagesMeta = parsed.images ?? [];

  const { createdBy: _createdBy, createdById, ...businessFields } = parsed.business;
  void _createdBy;
  const ownerId = typeof createdById === "string" ? createdById : undefined;

  const business = await createBusinessService({
    businessFields,
    ownerId,
    imagesMeta,
    imageFiles,
  });

  return ok(business);
}

export const POST = withLogging(withDomainErrorBoundary(createBusiness), "createBusiness");

export type BusinessUncheckedCreateInput = any;
