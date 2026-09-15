import { withLogging } from "@/lib/logging";
import { withDomainErrorBoundary } from "@/lib/api/boundary";
import { ok } from "@/lib/api/responses";
import { getDashboardCountsService } from "@/lib/services/management";

export const runtime = "nodejs";

async function getStats() {
  return ok(await getDashboardCountsService());
}

export const GET = withLogging(withDomainErrorBoundary(getStats), "getStats");

