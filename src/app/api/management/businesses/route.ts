import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withDomainErrorBoundary } from "@/lib/api/boundary";
import { ValidationError } from "@/lib/api/domain-errors";
import { parseListOptions, ListOptionsError } from "@/lib/api/list-options";
import {
  listBusinessesService,
  createSimpleBusinessService,
  updateSimpleBusinessService,
  deleteBusinessService,
} from "@/lib/services/business";
import {
  sortableFields,
  filterableFields,
  includeableRelations,
} from "@/lib/repos/business";

export const runtime = "nodejs";

async function getBusinesses(req: NextRequest) {
  try {
    const options = parseListOptions(
      req.nextUrl.searchParams,
      sortableFields,
      filterableFields,
      includeableRelations,
    );
    const data = await listBusinessesService(options, { includeUnpublished: true });
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    if (err instanceof ListOptionsError) {
      throw new ValidationError({ code: "bad-list-options", detail: err.message });
    }
    throw err;
  }
}

async function postBusiness(req: NextRequest) {
  const body = await req.json();
  const data = await createSimpleBusinessService({
    name: body.name,
    description: body.description,
    address: body.address,
    latitude: body.latitude,
    longitude: body.longitude,
    hours: body.hours,
    history: body.history,
  });
  return NextResponse.json(data, { status: 201 });
}

async function patchBusiness(req: NextRequest) {
  const body = await req.json();
  const data = await updateSimpleBusinessService({
    id: body.id,
    name: body.name,
    description: body.description,
    address: body.address,
    latitude: body.latitude,
    longitude: body.longitude,
    hours: body.hours,
    history: body.history,
  });
  return NextResponse.json(data, { status: 200 });
}

async function deleteBusiness(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  await deleteBusinessService(id ?? "");
  return NextResponse.json({ success: true }, { status: 200 });
}

export const GET = withLogging(withDomainErrorBoundary(getBusinesses), "getBusinesses");

export const POST = withLogging(withDomainErrorBoundary(postBusiness), "postBusiness");

export const PATCH = withLogging(withDomainErrorBoundary(patchBusiness), "patchBusiness");

export const DELETE = withLogging(withDomainErrorBoundary(deleteBusiness), "deleteBusiness");
