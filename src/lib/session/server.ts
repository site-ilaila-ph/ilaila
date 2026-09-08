import { SESSION_TOKEN_COOKIE_NAME } from "@/config/auth";
import { PrismaClient, User } from "@/generated/prisma/client";
<<<<<<< HEAD
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import type { CookieMap, CacheManager } from "../infra";
=======
import { CookieMap, CacheManager } from "../live";
>>>>>>> b378b4f0ac00170818702674e7d768e7e1efb2f8

export interface SessionReaderDependencies {
  cookieMap: CookieMap;
  db: PrismaClient;
  cache: CacheManager;
}



export interface SessionReader {
  getSessionId(): Promise<string | null>;
  getSessionUser(): Promise<User | null>;
}

export function createSessionReader(deps: SessionReaderDependencies): SessionReader {
  const { cookieMap, db, cache } = deps;

  return {
    async getSessionId(): Promise<string | null> {
      return cookieMap.get(SESSION_TOKEN_COOKIE_NAME);
    },

    async getSessionUser(): Promise<User | null> {
      const sessionId = cookieMap.get(SESSION_TOKEN_COOKIE_NAME);

      if (!sessionId) return null;

      const userId = await cache?.cached({
        key: ["session", "via-id", sessionId],
        fn: async () => {
<<<<<<< HEAD
          try {
            const session = await db.session.findUnique({
              where: { id: sessionId },
              select: { userId: true, expiresAt: true },
            });

            if (!session || session.expiresAt <= new Date()) return null;
            return session.userId;
          } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
              return null;
            }
            console.error(error);
            throw error;
          }
=======
          const session = await db.session.findUnique({
            where: { id: sessionId },
            select: { userId: true },
          });
          return session?.userId ?? null;
>>>>>>> b378b4f0ac00170818702674e7d768e7e1efb2f8
        },
        ttlSeconds: 60 * 15,
      });

      if (!userId || typeof userId !== "string") return null;

      return await cache.cached({
        key: ["user", "via-id", userId],
        fn: () => db.user.findUnique({ where: { id: userId } }),
        ttlSeconds: 60 * 5,
      });
    },
  };
}