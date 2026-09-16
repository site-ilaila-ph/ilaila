import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withDomainErrorBoundary } from "@/lib/api/boundary";
import { listUsersService, updateUserRoleService, deleteUserService } from "@/services/management-service";

export const runtime = "nodejs";

async function getUsers() {
  return NextResponse.json(await listUsersService(), { status: 200 });
}

async function patchUser(req: NextRequest) {
  const body = await req.json();
  const data = await updateUserRoleService({ userId: body.userId, isAdmin: body.isAdmin });
  return NextResponse.json(data, { status: 200 });
}

async function deleteUser(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  await deleteUserService(id ?? "");
  return NextResponse.json({ success: true }, { status: 200 });
}

export const GET = withLogging(withDomainErrorBoundary(getUsers), "getUsers");

export const PATCH = withLogging(withDomainErrorBoundary(patchUser), "patchUser");

export const DELETE = withLogging(withDomainErrorBoundary(deleteUser), "deleteUser");
