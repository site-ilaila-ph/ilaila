import { SESSION_TOKEN_COOKIE_NAME } from "@/config/auth";
import type { CookieMap, CacheManager } from "../infra";
import type { Contract } from "@/prisma/contract.d";
import type { PostgresClient } from "@internal/postgres/runtime";

export interface SessionReaderDependencies {
  cookieMap: CookieMap;
  db: PostgresClient<Contract>;
  cache: CacheManager;
}



export interface SessionUser {
  id: string;
  email: string;
  userName: string | null;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
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

    async getSessionUser(): Promise<User | null> {
      const sessionId = cookieMap.get(SESSION_TOKEN_COOKIE_NAME);

      if (!sessionId) return null;

      const userId = await cache?.cached({
        key: ["session", "via-id", sessionId],
        fn: async () => {
          try {
            const session = await db.orm.Session.where({ id: sessionId }).select("userId", "expiresAt").first();

            if (!session || session.expiresAt <= new Date()) return null;
            return session.userId;
          } catch (error: any) {
            return null;
          }
        },
        ttlSeconds: 60 * 15,
      });

      if (!userId || typeof userId !== "string") return null;

      return await cache.cached({
        key: ["user", "via-id", userId],
        fn: () => db.orm.User.where({ id: userId }).first(),
        ttlSeconds: 60 * 5,
      });
    },
  };
}