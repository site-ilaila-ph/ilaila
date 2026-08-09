import { cookies } from "next/headers";
import cache from "@/lib/server/caching/cache";
import { SESSION_TOKEN_COOKIE_NAME } from "@/config/auth";

export default async function signOut({}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_TOKEN_COOKIE_NAME)?.value ?? null;

  if (sessionToken) {
    await cache.delete(sessionToken);
    cookieStore.delete(SESSION_TOKEN_COOKIE_NAME);
  }
};