import { SESSION_TOKEN_COOKIE_NAME } from "@/config/auth";
import { acquireDb } from "@/lib/server/db";
import { acquireCacheManager } from "@/lib/server/cache";
import { acquireNextJSCookieMap } from "@/lib/server/cookies";
import type { PrismaClient } from "@/generated/prisma/client";

export type SessionUser = Awaited<ReturnType<PrismaClient['user']['findUnique']>>;

export async function getSessionId(): Promise<string | null> {
  const cookies = await acquireNextJSCookieMap();
  return cookies.get(SESSION_TOKEN_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookies = await acquireNextJSCookieMap();
  const sessionId = cookies.get(SESSION_TOKEN_COOKIE_NAME);

  if (!sessionId) return null;

  const db = acquireDb();
  const cache = acquireCacheManager();

  const userId = await cache.cached({
    key: ["session", "via-id", sessionId],
    fn: async () => {
      const session = await db.session.findUnique({
        where: { id: sessionId },
        select: { userId: true },
      });
      return session?.userId ?? null;
    },
    ttlSeconds: 60 * 15,
  });

  if (!userId || typeof userId !== "string") return null;

  return await cache.cached({
    key: ["user", "via-id", userId],
    fn: () => db.user.findUnique({ where: { id: userId } }),
    ttlSeconds: 60 * 5,
  });
}
