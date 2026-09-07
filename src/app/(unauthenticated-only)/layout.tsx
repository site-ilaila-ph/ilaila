import { redirect } from "next/navigation";
import { acquireCacheManager, acquireDb, acquireNextJSCookieMap } from "@/lib/infra";
import { createSessionReader } from "@/lib/session/server";

export default async function UnauthenticatedOnlyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = createSessionReader({
    db: acquireDb(),
    cache: acquireCacheManager(),
    cookieMap: await acquireNextJSCookieMap(),
  });

  if (await session.getSessionUser()) redirect("/home");

  return children;
}
