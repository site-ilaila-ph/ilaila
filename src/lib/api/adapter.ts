import type { NextRequest, NextResponse } from "next/server";
import type { AnyRequestHandler } from "../next-types";

export function adaptParams(
  fn: (request: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<NextResponse>,
): AnyRequestHandler {
  return async (request: NextRequest, ctx: { params: Promise<{ id: string }> }) => fn(request, ctx);
}
