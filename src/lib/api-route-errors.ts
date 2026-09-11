import { NextResponse } from "next/server";
import { internalErrorProblem } from "./problem";

export function mapKnownApiRouteFailure(error: unknown, fallback = "Unknown error"): NextResponse {
  const message = error instanceof Error ? error.message : fallback;
  return internalErrorProblem(message);
}

