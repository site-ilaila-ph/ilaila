import { createContext, useContext } from "react";

import { User } from "@/generated/prisma/client";

export type ClientSessionUser = Omit<User, 'createdAt' | 'updatedAt' | 'passwordHash'>;

export type ClientReadonlySession = {
    id: string;
    user: ClientSessionUser;
}

// models `useSession()` in the client.
export type ClientUseSessionFn = () => ClientReadonlySession;

const SessionContext = createContext<ClientReadonlySession | null>(null);

import { SESSION_TOKEN_COOKIE_NAME } from "@/config/auth";
import type { PrismaClient } from "@/generated/prisma/client";
import { CacheManager, CookieMap } from "@/lib/live";

export type SessionUser = Awaited<ReturnType<PrismaClient['user']['findUnique']>>;

export interface SessionReaderDependencies {
  cookieMap: CookieMap;
  db: PrismaClient;
  cache: CacheManager;
}

export interface SessionReader {
  getSessionId(): Promise<string | null>;
  getSessionUser(): Promise<SessionUser | null>;
}

export function createSessionReader(deps: SessionReaderDependencies): SessionReader {
  const { cookieMap, db, cache } = deps;

  return {
    async getSessionId(): Promise<string | null> {
      return cookieMap.get(SESSION_TOKEN_COOKIE_NAME);
    },

    async getSessionUser(): Promise<SessionUser | null> {
      const sessionId = cookieMap.get(SESSION_TOKEN_COOKIE_NAME);

      if (!sessionId) return null;

      const userId = await cache?.cached({
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
    },
  };
}

const useSession = () => {
  const session = useContext(SessionContext);
  return session;
}

export { SessionContext, useSession };
