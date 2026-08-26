import { cookies } from "next/headers";
import { acquireCacheManager } from "@/lib/live";
import { SESSION_TOKEN_COOKIE_NAME } from "@/config/auth";

export default async function signOut({}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_TOKEN_COOKIE_NAME)?.value ?? null;

  if (sessionToken) {
    const cache = acquireCacheManager();
    await cache.invalidate({ key: ["session", "via-id", sessionToken] });
    cookieStore.delete(SESSION_TOKEN_COOKIE_NAME);
  }
};