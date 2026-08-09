import { cookies } from "next/headers";
import db from "@/lib/server/db";
import cache from "@/lib/server/caching/cache";
import { SESSION_TOKEN_COOKIE_NAME } from "@/config/auth";

export type SessionUser = Awaited<ReturnType<typeof db.user.findUnique>>;

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN_COOKIE_NAME)?.value ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const sessionId = await getSessionId();

  if (!sessionId) return null;

  const userId = await cache.get(sessionId);
  if (!userId || typeof userId !== "string") return null;

  return await db.user.findUnique({ where: { id: userId } });
}