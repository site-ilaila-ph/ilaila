import { cookies } from "next/headers";
import db from "@/lib/server/db";
import { cache } from "@/lib/server/cache";
import { SESSION_TOKEN_COOKIE_NAME } from "@/config/auth";

export type SessionUser = Awaited<ReturnType<typeof db.user.findUnique>>;

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN_COOKIE_NAME)?.value ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const sessionId = await getSessionId();

  if (!sessionId) return null;

  // 1. Resolve session/user ID through the cache layer
  const userId = await cache({
    key: ["session", "via-id", sessionId],
    fn: async () => {
      // Assuming you have a way to resolve the user ID from the session token,
      // or if sessionId itself maps to a user lookup. Adjust query as needed.
      const session = await db.session.findUnique({
        where: { id: sessionId },
        select: { userId: true },
      });
      return session?.userId ?? null;
    },
    ttlSeconds: 60 * 15,
  });

  if (!userId || typeof userId !== "string") return null;

  return await cache({
    key: ["user", "via-id", userId],
    fn: () => db.user.findUnique({ where: { id: userId } }),
    ttlSeconds: 60 * 5, // Optional TTL for user profile
  });
}